import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/app/lib/admin-session";
import { isSameOriginRequest } from "@/app/lib/require-admin";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ error: "Permintaan lintas origin ditolak." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
