import { isAdminAuthenticated, isSameOriginRequest } from "@/app/lib/require-admin";
import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

type Context = { params: Promise<{ nis: string }> };
type Participant = {
  nis: string;
  nama_lengkap: string;
  kelas: string;
  no_wa: string;
  email: string;
  rumpun_ilmu_1: string;
  rumpun_ilmu_2: string;
};

async function getTarget(request: Request, context: Context) {
  if (!isSameOriginRequest(request)) return { error: Response.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 }) };
  if (!(await isAdminAuthenticated())) return { error: Response.json({ error: "Sesi admin tidak valid." }, { status: 401 }) };
  const config = getSupabaseServerConfig();
  if (!config) return { error: Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 }) };
  const { nis } = await context.params;
  if (!/^\d{1,30}$/.test(nis)) return { error: Response.json({ error: "NIS tidak valid." }, { status: 400 }) };
  let body: unknown = null;
  if (request.method === "PATCH") {
    try { body = await request.json(); } catch { return { error: Response.json({ error: "Data peserta tidak valid." }, { status: 400 }) }; }
  }
  return { config, nis, body };
}

export async function PATCH(request: Request, context: Context) {
  const target = await getTarget(request, context);
  if ("error" in target) return target.error;
  const { config, nis, body } = target;
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ error: "Data peserta tidak valid." }, { status: 400 });
  const parsed = parseParticipantBody(body as Record<string, unknown>, nis);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });
  try {
    const optionError = await validateOptions(config, parsed.participant);
    if (optionError) return Response.json({ error: optionError }, { status: 400 });
    const query = new URLSearchParams({ nis: `eq.${nis}`, select: "nis,nama_lengkap,kelas,no_wa,email,pas_foto,rumpun_ilmu_1,rumpun_ilmu_2,created_at" });
    const response = await fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable, query), {
      method: "PATCH",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(parsed.participant),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: "Data peserta gagal diperbarui." }, { status: 502 });
    const [participant] = await response.json();
    if (!participant) return Response.json({ error: "Peserta tidak ditemukan." }, { status: 404 });
    return Response.json({ participant }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const target = await getTarget(request, context);
  if ("error" in target) return target.error;
  const { config, nis } = target;
  const query = new URLSearchParams({ nis: `eq.${nis}`, select: "nis,pas_foto" });
  try {
    const response = await fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable, query), {
      method: "DELETE",
      headers: supabaseHeaders(config.serviceKey, { Prefer: "return=representation" }),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: "Peserta gagal dihapus." }, { status: 502 });
    const [participant] = await response.json();
    if (!participant) return Response.json({ error: "Peserta tidak ditemukan." }, { status: 404 });
    if (participant.pas_foto) {
      const encodedPath = participant.pas_foto.split("/").map(encodeURIComponent).join("/");
      await fetch(`${config.baseUrl}/storage/v1/object/${config.bucket}/${encodedPath}`, { method: "DELETE", headers: supabaseHeaders(config.serviceKey) });
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}

function parseParticipantBody(body: Record<string, unknown>, nis: string) {
  return parseParticipant({ ...body, nis });
}

type ParticipantInput = {
  nis?: unknown;
  nama_lengkap?: unknown;
  kelas?: unknown;
  no_wa?: unknown;
  email?: unknown;
  rumpun_ilmu_1?: unknown;
  rumpun_ilmu_2?: unknown;
};

function parseParticipant(body: ParticipantInput) {
  const participant = {
    nis: typeof body.nis === "string" ? body.nis.trim() : "",
    nama_lengkap: typeof body.nama_lengkap === "string" ? body.nama_lengkap.trim() : "",
    kelas: typeof body.kelas === "string" ? body.kelas.trim() : "",
    no_wa: typeof body.no_wa === "string" ? body.no_wa.trim() : "",
    email: typeof body.email === "string" ? body.email.trim() : "",
    rumpun_ilmu_1: typeof body.rumpun_ilmu_1 === "string" ? body.rumpun_ilmu_1.trim() : "",
    rumpun_ilmu_2: typeof body.rumpun_ilmu_2 === "string" ? body.rumpun_ilmu_2.trim() : "",
  };
  if (Object.values(participant).some((value) => !value)) return { error: "Lengkapi semua data peserta." };
  if (!/^\d{1,30}$/.test(participant.nis)) return { error: "NIS harus berupa angka dengan maksimal 30 digit." };
  if (participant.nama_lengkap.length > 120 || participant.kelas.length > 40 || participant.no_wa.length > 25 || participant.email.length > 254) return { error: "Ada data yang melebihi batas panjang yang diizinkan." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)) return { error: "Format email tidak valid." };
  if (participant.rumpun_ilmu_1 === participant.rumpun_ilmu_2) return { error: "Pilih dua rumpun ilmu yang berbeda." };
  return { participant };
}

async function validateOptions(config: NonNullable<ReturnType<typeof getSupabaseServerConfig>>, participant: Participant) {
  const query = (table: string, label: string) => new URLSearchParams({ select: "label", label: `eq.${label}`, active: "eq.true", limit: "1" });
  const responses = await Promise.all([
    fetch(supabaseTableUrl(config.baseUrl, config.classesTable, query(config.classesTable, participant.kelas)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
    fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, query(config.rumpunTable, participant.rumpun_ilmu_1)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
    fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, query(config.rumpunTable, participant.rumpun_ilmu_2)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
  ]);
  if (responses.some((response) => !response.ok)) return "Pemeriksaan opsi formulir gagal.";
  const rows = await Promise.all(responses.map((response) => response.json())) as Array<Array<{ label: string }>>;
  return rows.some((items) => items.length === 0) ? "Pilih kelas dan rumpun ilmu yang masih aktif." : null;
}
