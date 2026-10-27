import { getPemetaanSupabaseConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

export async function GET() {
  const config = getPemetaanSupabaseConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });

  try {
    const [classesResponse, rumpunResponse] = await Promise.all([
      fetch(supabaseTableUrl(config.baseUrl, config.classesTable, new URLSearchParams({ select: "label", active: "eq.true", order: "sort_order.asc,label.asc" })), {
        headers: supabaseHeaders(config.serviceKey), cache: "no-store",
      }),
      fetch(supabaseTableUrl(config.baseUrl, config.rumpunTable, new URLSearchParams({ select: "label", active: "eq.true", order: "sort_order.asc,label.asc" })), {
        headers: supabaseHeaders(config.serviceKey), cache: "no-store",
      }),
    ]);
    if (!classesResponse.ok || !rumpunResponse.ok) {
      const failedResponse = !classesResponse.ok ? classesResponse : rumpunResponse;
      const errorBody = await failedResponse.text();
      let errorCode = "";
      try {
        errorCode = (JSON.parse(errorBody) as { code?: string }).code || "";
      } catch {
        // Keep the response generic when Supabase does not return JSON.
      }
      if (errorCode === "42501" || failedResponse.status === 401 || failedResponse.status === 403) {
        return Response.json({ error: "Key Supabase tidak memiliki akses ke tabel opsi. Gunakan service role/secret key di SUPABASE_SERVICE_ROLE_KEY." }, { status: 503 });
      }
      return Response.json({ error: "Opsi form belum tersedia. Pastikan migrasi Supabase sudah dijalankan." }, { status: 503 });
    }
    const [classes, rumpun] = await Promise.all([classesResponse.json(), rumpunResponse.json()]);
    return Response.json({ classes, rumpun }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat memuat opsi form." }, { status: 502 });
  }
}
