import { isAdminAuthenticated } from "@/app/lib/require-admin";
import { getPemetaanSupabaseConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getPemetaanSupabaseConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });
  const nis = new URL(request.url).searchParams.get("nis")?.trim();
  if (!nis || !/^\d{1,30}$/.test(nis)) return Response.json({ error: "NIS tidak valid." }, { status: 400 });

  try {
    const query = new URLSearchParams({ select: "pas_foto", nis: `eq.${nis}`, limit: "1" });
    const recordResponse = await fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable, query), {
      headers: supabaseHeaders(config.serviceKey), cache: "no-store",
    });
    if (!recordResponse.ok) return Response.json({ error: "Data peserta tidak ditemukan." }, { status: 404 });
    const [record] = await recordResponse.json();
    if (!record?.pas_foto || !String(record.pas_foto).startsWith(`${nis}/`)) {
      return Response.json({ error: "Pas foto tidak tersedia." }, { status: 404 });
    }

    const path = String(record.pas_foto).split("/").map(encodeURIComponent).join("/");
    const signResponse = await fetch(`${config.baseUrl}/storage/v1/object/sign/${config.bucket}/${path}`, {
      method: "POST",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json" }),
      body: JSON.stringify({ expiresIn: 60 }),
      cache: "no-store",
    });
    if (!signResponse.ok) return Response.json({ error: "Tautan pas foto gagal dibuat." }, { status: 502 });
    const result = await signResponse.json() as { signedURL?: string };
    if (!result.signedURL) return Response.json({ error: "Tautan pas foto tidak tersedia." }, { status: 502 });

    const signedUrl = new URL(result.signedURL, config.baseUrl);
    if (signedUrl.origin !== new URL(config.baseUrl).origin) {
      return Response.json({ error: "Tautan pas foto tidak valid." }, { status: 502 });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl.toString(),
        "Cache-Control": "no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return Response.json({ error: "Tidak dapat mengakses pas foto." }, { status: 502 });
  }
}
