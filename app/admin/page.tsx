import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from "@/app/lib/admin-session";
import AdminDashboardClient from "./dashboard-client";
import AdminLogoutButton from "./logout-button";

export const metadata = { title: "Admin | EXCAMP 27" };

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AuthenticatedAdminPage />
    </Suspense>
  );
}

async function AuthenticatedAdminPage() {
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

function AdminLoading() {
  return (
    <main className="grid min-h-svh place-items-center bg-[#f4ecdc] px-4 text-[#655b51]">
      <p role="status">Memuat area admin…</p>
    </main>
  );
}
