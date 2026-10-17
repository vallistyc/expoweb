"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  async function logout() {
    setIsLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isLoggingOut}
      className="border border-[#281311] px-4 py-2 font-semibold text-[#281311] transition-colors hover:bg-[#281311] hover:text-[#f0c77c] disabled:opacity-60"
    >
      {isLoggingOut ? "Keluar…" : "Keluar"}
    </button>
  );
}
