import { isAdminAuthenticated, isSameOriginRequest } from "@/app/lib/require-admin";
import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

type Context = { params: Promise<{ id: string }> };

async function supabaseError(response: Response, fallback: string) {
  const body = await response.text();
  try {
    const parsed = JSON.parse(body) as { code?: string; message?: string };
    if (parsed.code === "23505") return "Opsi dengan nama itu sudah ada.";
    if (parsed.code === "23503") return "Opsi ini masih digunakan peserta. Nonaktifkan opsi jika tidak ingin dipakai lagi.";
  } catch {}
  return fallback;
}

async function getTarget(request: Request, context: Context) {
  if (!isSameOriginRequest(request)) return { error: Response.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 }) };
  if (!(await isAdminAuthenticated())) return { error: Response.json({ error: "Sesi admin tidak valid." }, { status: 401 }) };
  const config = getSupabaseServerConfig();
  if (!config) return { error: Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 }) };
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return { error: Response.json({ error: "ID opsi tidak valid." }, { status: 400 }) };
  }
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { error: Response.json({ error: "Data opsi tidak valid." }, { status: 400 }) };
    }
    body = parsed as Record<string, unknown>;
  } catch { return { error: Response.json({ error: "Data opsi tidak valid." }, { status: 400 }) }; }
  if (body.type !== "kelas" && body.type !== "rumpun") {
    return { error: Response.json({ error: "Jenis opsi tidak valid." }, { status: 400 }) };
  }
  return { config, id, body, table: body.type === "kelas" ? config.classesTable : config.rumpunTable };
}

export async function PATCH(request: Request, context: Context) {
  const target = await getTarget(request, context);
  if ("error" in target) return target.error;
  const { config, id, body, table } = target;
  const update: { label?: string; active?: boolean; sort_order?: number } = {};
  if (body.label !== undefined) {
    if (typeof body.label !== "string" || !body.label.trim() || body.label.trim().length > (body.type === "kelas" ? 40 : 100)) {
      return Response.json({ error: "Nama opsi tidak valid." }, { status: 400 });
    }
    update.label = body.label.trim();
  }
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") return Response.json({ error: "Status opsi tidak valid." }, { status: 400 });
    update.active = body.active;
  }
  if (body.sort_order !== undefined) {
    if (!Number.isInteger(body.sort_order) || Number(body.sort_order) < 0 || Number(body.sort_order) > 1000000) {
      return Response.json({ error: "Urutan opsi tidak valid." }, { status: 400 });
    }
    update.sort_order = Number(body.sort_order);
  }
  if (Object.keys(update).length === 0) return Response.json({ error: "Tidak ada perubahan untuk disimpan." }, { status: 400 });

  const query = new URLSearchParams({ id: `eq.${id}`, select: "id,label,sort_order,active" });
  try {
    const response = await fetch(supabaseTableUrl(config.baseUrl, table, query), {
      method: "PATCH",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json", Prefer: "return=representation" }),
      body: JSON.stringify(update),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: await supabaseError(response, "Opsi tidak dapat diperbarui.") }, { status: response.status === 409 ? 409 : 502 });
    const rows = await response.json();
    if (!rows.length) return Response.json({ error: "Opsi tidak ditemukan." }, { status: 404 });
    return Response.json({ option: rows[0] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const target = await getTarget(request, context);
  if ("error" in target) return target.error;
  const { config, id, table } = target;
  const query = new URLSearchParams({ id: `eq.${id}`, select: "id" });
  try {
    const response = await fetch(supabaseTableUrl(config.baseUrl, table, query), {
      method: "DELETE",
      headers: supabaseHeaders(config.serviceKey, { Prefer: "return=representation" }),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: await supabaseError(response, "Opsi gagal dihapus.") }, { status: response.status === 409 ? 409 : 502 });
    const rows = await response.json();
    if (!rows.length) return Response.json({ error: "Opsi tidak ditemukan." }, { status: 404 });
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Tidak dapat menghubungi database." }, { status: 502 });
  }
}
