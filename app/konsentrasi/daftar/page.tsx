"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

export default function DaftarKonsentrasi() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [rumpunOptions, setRumpunOptions] = useState<string[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [rumpun1, setRumpun1] = useState("");
  const [rumpun2, setRumpun2] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/konsentrasi/options", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Opsi formulir gagal dimuat.");
        if (active) {
          setClasses(result.classes.map((option: { label: string }) => option.label));
          setRumpunOptions(result.rumpun.map((option: { label: string }) => option.label));
        }
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Opsi formulir gagal dimuat.");
      })
      .finally(() => {
        if (active) setOptionsLoaded(true);
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    if (formData.get("rumpun_ilmu_1") === formData.get("rumpun_ilmu_2")) {
      setError("Pilih dua rumpun ilmu yang berbeda.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/konsentrasi", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Formulir belum dapat dikirim. Silakan coba lagi.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Koneksi bermasalah. Periksa internet lalu coba lagi.");
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#f4ecdc] px-4 py-15 text-center text-[#1e1608] sm:py-12" aria-live="polite" aria-busy="true">
        <div className="w-full max-w-3xl border border-[#281311]/15 bg-[#fffcf6] p-8 shadow-2xl shadow-[#281311]/10 sm:p-14">
          {!submitted && <span className="mx-auto mb-6 block size-12 animate-spin rounded-full border-4 border-[#e7d9c4] border-t-[#9b5c31] motion-reduce:animate-none" aria-hidden="true" />}
          <h1 className="font-montserrat text-3xl leading-tight font-bold sm:text-5xl">{submitted ? "Berhasil terkirim" : "Mengirim formulir…"}</h1>
          <p className="mt-4 leading-relaxed text-[#655b51]">
            {submitted
              ? "Pilihan rumpun ilmumu sudah tersimpan. Terima kasih!"
              : "Mohon tunggu, data sedang disimpan."}
          </p>
          {submitted && (
            <Link className="mt-3 inline-block font-semibold text-[#714526] underline underline-offset-4" href="/">Kembali ke beranda</Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-svh place-items-center bg-[radial-gradient(ellipse_at_90%_0%,rgba(240,199,124,0.22),transparent_35rem),#f4ecdc] px-4 pt-8 pb-6 text-[#1e1608] md:pt-12 md:pb-12">
      <div className="w-full max-w-3xl border border-[#281311]/15 bg-[#fffcf6]/95 p-6 shadow-2xl shadow-[#281311]/10 sm:p-10 lg:p-14">
        <p className="mb-2 font-kastemo text-[0.95rem] tracking-[0.12em] text-[#9b5c31] uppercase">Kelas Konsentrasi</p>
        <h1 className="font-montserrat text-3xl leading-tight font-bold sm:text-5xl">Form Pemetaan Rumpun Ilmu</h1>
        <p className="mt-4 mb-8 max-w-2xl leading-relaxed text-[#655b51]">
          Lengkapi data diri dan pilih dua rumpun ilmu yang paling ingin kamu
          eksplorasi. Setiap NIS hanya dapat mengirim satu kali.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
            <span>NIS <b className="text-[#aa3d2f">*</b></span>
            <input className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="nis" inputMode="numeric" autoComplete="off" required maxLength={30} />
          </label>
          <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
            <span>Nama lengkap <b className="text-[#aa3d2f">*</b></span>
            <input className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="nama_lengkap" autoComplete="name" required maxLength={120} />
          </label>
          <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
            <span>Kelas <b className="text-[#aa3d2f">*</b></span>
            <select className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="kelas" required defaultValue="">
              <option value="" disabled>{optionsLoaded ? "Pilih kelas" : "Memuat opsi kelas…"}</option>
              {classes.map((kelas) => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
              <span>Nomor WhatsApp <b className="text-[#aa3d2f">*</b></span>
              <input className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="no_wa" type="tel" autoComplete="tel" required maxLength={25} />
            </label>
            <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
              <span>Email <b className="text-[#aa3d2f">*</b></span>
              <input className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="email" type="email" autoComplete="email" required maxLength={254} />
            </label>
          </div>
          <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
            <span>Pas foto <small className="text-[0.8rem] font-normal text-[#776a5e]">(opsional, JPG/PNG/WebP, maks. 5 MB)</small></span>
            <input className="min-h-12 w-full border border-[#d7cbbb] bg-white p-2 text-sm font-normal file:mr-3 file:border-0 file:bg-[#f4ecdc] file:px-3 file:py-2 file:font-semibold" name="pas_foto" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
              <span>Rumpun ilmu pilihan 1 <b className="text-[#aa3d2f">*</b></span>
              <select className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="rumpun_ilmu_1" required value={rumpun1} onChange={(event) => setRumpun1(event.target.value)}>
                <option value="" disabled>{optionsLoaded ? "Pilih rumpun ilmu" : "Memuat opsi…"}</option>
                {rumpunOptions.map((option) => <option key={option} value={option} disabled={option === rumpun2}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-[0.94rem] font-semibold text-[#281311]">
              <span>Rumpun ilmu pilihan 2 <b className="text-[#aa3d2f">*</b></span>
              <select className="min-h-12 w-full border border-[#d7cbbb] bg-white px-3 py-2 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31]" name="rumpun_ilmu_2" required value={rumpun2} onChange={(event) => setRumpun2(event.target.value)}>
                <option value="" disabled>{optionsLoaded ? "Pilih rumpun ilmu yang berbeda" : "Memuat opsi…"}</option>
                {rumpunOptions.map((option) => <option key={option} value={option} disabled={option === rumpun1}>{option}</option>)}
              </select>
            </label>
          </div>

          {error && <p className="m-0 font-semibold text-[#a33126]" role="alert">{error}</p>}
          <button disabled={!optionsLoaded || classes.length === 0 || rumpunOptions.length < 2} className="mt-2 flex min-h-14 items-center justify-between border-0 bg-[#281311] px-5 py-3 font-bold text-[#f0c77c] transition-colors hover:bg-[#f0c77c] hover:text-[#281311] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5c31] motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50" type="submit">
            Kirim formulir <span aria-hidden="true">↗</span>
          </button>
          <p className="-mt-2 m-0 text-center text-xs text-[#776a5e]">Pastikan data dan pilihanmu sudah benar sebelum mengirim.</p>
        </form>
      </div>
    </main>
  );
}
