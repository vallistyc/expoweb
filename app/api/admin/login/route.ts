import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminToken,
  hashRateLimitKey,
  verifyAdminCredentials,
} from "@/app/lib/admin-session";
import { getSupabaseServerConfig, supabaseHeaders } from "@/app/lib/supabase-server";
import { isSameOriginRequest } from "@/app/lib/require-admin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 });
  }
  const config = getSupabaseServerConfig();
  if (!config) {
    return NextResponse.json({ error: "Database admin belum dikonfigurasi." }, { status: 503 });
  }
  const clientIp = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipKey = hashRateLimitKey(clientIp);
  if (!ipKey) return NextResponse.json({ error: "Sesi admin belum dikonfigurasi." }, { status: 503 });

  try {
    const rateResponse = await fetch(`${config.baseUrl}/rest/v1/rpc/allow_admin_login_attempt`, {
      method: "POST",
      headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json" }),
      body: JSON.stringify({ p_ip_key: ipKey }),
      cache: "no-store",
    });
    if (!rateResponse.ok) return NextResponse.json({ error: "Pembatasan login belum siap. Jalankan migrasi Supabase." }, { status: 503 });
    if (!(await rateResponse.json())) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." }, { status: 429 });
    }
  } catch {
    return NextResponse.json({ error: "Tidak dapat memeriksa batas percobaan login." }, { status: 503 });
  }

  let body: { username?: unknown; password?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Data login tidak valid." }, { status: 400 });
  }

  if (!body || typeof body.username !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Masukkan username dan password." }, { status: 400 });
  }
  if (!verifyAdminCredentials(body.username, body.password)) {
    return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
  }

  const session = createAdminToken();
  if (!session) {
    return NextResponse.json({ error: "ADMIN_SESSION_SECRET belum dikonfigurasi." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
