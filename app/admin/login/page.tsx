"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Login gagal. Silakan coba kembali.");
        setIsSubmitting(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Koneksi bermasalah. Silakan coba kembali.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(ellipse_at_90%_0%,rgba(240,199,124,0.22),transparent_35rem),#f4ecdc] px-4 pt-28 pb-8 text-[#1e1608] md:pt-36">
      <section className="w-full max-w-md border border-[#281311]/15 bg-[#fffcf6]/95 p-6 shadow-2xl shadow-[#281311]/10 sm:p-10">
        <Link className="text-sm font-semibold text-[#714526] underline underline-offset-4" href="/">← Beranda</Link>
        <p className="mt-8 mb-2 font-kastemo tracking-[0.12em] text-[#9b5c31] uppercase">Area terbatas</p>
        <h1 className="font-montserrat text-3xl font-bold">Login Admin</h1>
        <p className="mt-3 mb-7 leading-relaxed text-[#655b51]">Masuk untuk membuka panel admin EXCAMP.</p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-[#281311]">
            Username
            <input
              className="min-h-12 border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]"
              name="username"
              autoComplete="username"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#281311]">
            Password
            <input
              className="min-h-12 border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p role="alert" className="m-0 text-sm font-semibold text-[#a33126]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 min-h-12 bg-[#281311] px-5 py-3 font-bold text-[#f0c77c] transition-colors hover:bg-[#f0c77c] hover:text-[#281311] disabled:cursor-wait disabled:opacity-70"
          >
            {isSubmitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
      </section>
    </main>
  );
}
