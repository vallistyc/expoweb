import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/app/lib/admin-session";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
