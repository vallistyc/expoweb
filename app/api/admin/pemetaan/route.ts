import { isAdminAuthenticated } from "@/app/lib/require-admin";
import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getSupabaseServerConfig();
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
