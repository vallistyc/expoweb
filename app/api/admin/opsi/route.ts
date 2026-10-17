import { isAdminAuthenticated, isSameOriginRequest } from "@/app/lib/require-admin";
import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

type OptionType = "kelas" | "rumpun";

function optionTable(config: NonNullable<ReturnType<typeof getSupabaseServerConfig>>, type: OptionType) {
  return type === "kelas" ? config.classesTable : config.rumpunTable;
}

async function readBody(request: Request) {
  try {
    return await request.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 });
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getSupabaseServerConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const body = await readBody(request);
  if (!body || (body.type !== "kelas" && body.type !== "rumpun") || typeof body.label !== "string") {
    return Response.json({ error: "Jenis dan nama opsi wajib diisi." }, { status: 400 });
  }

  const label = body.label.trim();
  const maxLength = body.type === "kelas" ? 40 : 100;
  if (!label || label.length > maxLength) return Response.json({ error: `Nama opsi maksimal ${maxLength} karakter.` }, { status: 400 });

  const table = optionTable(config, body.type as OptionType);
  const query = new URLSearchParams({ select: "id,label,sort_order,active" });
  try {
    const response = await fetch(supabaseTableUrl(config.baseUrl, table, query), {
      method: "POST",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify({ label, active: true, sort_order: Date.now() }),
      cache: "no-store",
    });
    if (!response.ok) {
      if (response.status === 409) return Response.json({ error: "Opsi dengan nama itu sudah ada." }, { status: 409 });
      return Response.json({ error: "Opsi gagal ditambahkan." }, { status: 502 });
    }
    const [option] = await response.json();
    return Response.json({ option }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}
