import { isAdminAuthenticated, isSameOriginRequest } from "@/app/lib/require-admin";
import { getPemetaanSupabaseConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

const PAGE_SIZE = 50;

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
  if (participant.nama_lengkap.length > 120 || participant.kelas.length > 40 || participant.no_wa.length > 25 || participant.email.length > 254) {
    return { error: "Ada data yang melebihi batas panjang yang diizinkan." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)) return { error: "Format email tidak valid." };
  if (participant.rumpun_ilmu_1 === participant.rumpun_ilmu_2) return { error: "Pilih dua rumpun ilmu yang berbeda." };
  return { participant };
}

async function readJson(request: Request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? body as ParticipantInput : null;
  } catch {
    return null;
  }
}

async function validateOptions(
  config: NonNullable<ReturnType<typeof getPemetaanSupabaseConfig>>,
  participant: NonNullable<ReturnType<typeof parseParticipant>["participant"]>,
) {
  const optionQuery = (table: string, label: string) => new URLSearchParams({
    select: "label",
    label: `eq.${label}`,
    active: "eq.true",
    limit: "1",
  });
  const responses = await Promise.all([
    fetch(supabaseTableUrl(config.baseUrl, config.classesTable, optionQuery(config.classesTable, participant.kelas)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
    fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, optionQuery(config.rumpunTable, participant.rumpun_ilmu_1)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
    fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, optionQuery(config.rumpunTable, participant.rumpun_ilmu_2)), { headers: supabaseHeaders(config.serviceKey), cache: "no-store" }),
  ]);
  if (responses.some((response) => !response.ok)) return "Pemeriksaan opsi formulir gagal.";
  const rows = await Promise.all(responses.map((response) => response.json())) as Array<Array<{ label: string }>>;
  return rows.some((items) => items.length === 0) ? "Pilih kelas dan rumpun ilmu yang masih aktif." : null;
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 });
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getPemetaanSupabaseConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const body = await readJson(request);
  const parsed = body && parseParticipant(body);
  if (!parsed || "error" in parsed) return Response.json({ error: parsed?.error || "Data peserta tidak valid." }, { status: 400 });
  try {
    const optionError = await validateOptions(config, parsed.participant);
    if (optionError) return Response.json({ error: optionError }, { status: 400 });
    const response = await fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable), {
      method: "POST",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ ...parsed.participant, pas_foto: null }),
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 409) return Response.json({ error: "NIS ini sudah terdaftar." }, { status: 409 });
      return Response.json({ error: "Peserta gagal ditambahkan." }, { status: 502 });
    }
    const [participant] = await response.json();
    return Response.json({ participant }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getPemetaanSupabaseConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });

  const pageParam = Number(new URL(request.url).searchParams.get("page") || "1");
  const page = Number.isInteger(pageParam) ? Math.max(1, Math.min(pageParam, 100000)) : 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const recordsQuery = new URLSearchParams({
    select: "nis,nama_lengkap,kelas,no_wa,email,pas_foto,rumpun_ilmu_1,rumpun_ilmu_2,created_at",
    order: "created_at.desc",
  });
  const optionQuery = new URLSearchParams({ select: "id,label,sort_order,active", order: "sort_order.asc,label.asc" });
  const statsQuery = new URLSearchParams({ select: "label,total,pilihan_1,pilihan_2,active", order: "total.desc,label.asc" });
  const baseHeaders = supabaseHeaders(config.serviceKey);

  try {
    const [recordsResponse, statsResponse, classesResponse, rumpunResponse] = await Promise.all([
      fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable, recordsQuery), {
        headers: { ...baseHeaders, Prefer: "count=exact", Range: `${from}-${to}`, "Range-Unit": "items" }, cache: "no-store",
      }),
      fetch(supabaseTableUrl(config.baseUrl, config.statsView, statsQuery), { headers: baseHeaders, cache: "no-store" }),
      fetch(supabaseTableUrl(config.baseUrl, config.classesTable, optionQuery), { headers: baseHeaders, cache: "no-store" }),
      fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, optionQuery), { headers: baseHeaders, cache: "no-store" }),
    ]);

    if (![recordsResponse, statsResponse, classesResponse, rumpunResponse].every((response) => response.ok)) {
      return Response.json({ error: "Gagal membaca data dashboard. Pastikan migrasi database terbaru sudah dijalankan." }, { status: 502 });
    }
    const [participants, stats, classes, rumpun] = await Promise.all([
      recordsResponse.json(), statsResponse.json(), classesResponse.json(), rumpunResponse.json(),
    ]);
    const contentRange = recordsResponse.headers.get("content-range");
    const total = contentRange?.split("/")[1] === "*" ? 0 : Number(contentRange?.split("/")[1] || 0);
    return Response.json({ participants, stats, classes, rumpun, page, pageSize: PAGE_SIZE, total }, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}
