import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/app/lib/admin-session";
import AdminDashboardClient from "./dashboard-client";
import AdminLogoutButton from "./logout-button";

export const metadata = { title: "Admin | EXCAMP 27" };

export default async function AdminPage() {
  // Token expiry depends on the current time, so evaluate auth only per request.
  await connection();
  const cookieStore = await cookies();
  if (!isValidAdminToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) redirect("/admin/login");

  return (
    <main className="min-h-svh bg-[#f4ecdc] pt-28 text-[#1e1608] md:pt-36">
      <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/admin" className="font-montserrat text-sm font-bold tracking-wide">EXCAMP <span className="text-[#9b5c31]">ADMIN</span></Link>
        <AdminLogoutButton />
      </header>
      <AdminDashboardClient />
    </main>
  );
}
