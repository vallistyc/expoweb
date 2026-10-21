"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type Participant = {
  nis: string;
  nama_lengkap: string;
  kelas: string;
  no_wa: string;
  email: string;
  pas_foto: string | null;
  rumpun_ilmu_1: string;
  rumpun_ilmu_2: string;
  created_at: string;
};
type ParticipantForm = Omit<Participant, "pas_foto" | "created_at">;
type NotificationMessage = { id: number; title: string; message: string; tone: "success" | "error" };
type Stat = { label: string; total: number; pilihan_1: number; pilihan_2: number; active: boolean };
type Option = { id: string; label: string; sort_order: number; active: boolean };
type DashboardData = {
  participants: Participant[];
  stats: Stat[];
  classes: Option[];
  rumpun: Option[];
  page: number;
  pageSize: number;
  total: number;
};

const colors = ["#9b5c31", "#d39b49", "#385f6a", "#7c4b52", "#718a5e", "#bd7251", "#726398", "#456b8a", "#ac9a72"];
const numberFormat = new Intl.NumberFormat("id-ID");
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default function AdminDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [optionType, setOptionType] = useState<"kelas" | "rumpun">("kelas");
  const [newLabel, setNewLabel] = useState("");
  const [editing, setEditing] = useState<{ id: string; label: string } | null>(null);
  const [savingOption, setSavingOption] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [participantForm, setParticipantForm] = useState<ParticipantForm | null>(null);
  const [savingParticipant, setSavingParticipant] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] = useState(false);
  const notificationId = useRef(0);
  const knownParticipantTotal = useRef<number | null>(null);

  const loadData = useCallback(async (requestedPage: number, showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch(`/api/admin/pemetaan?page=${requestedPage}`, { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Data dashboard gagal dimuat.");
      setData(result);
      setUpdatedAt(new Date());
      setError("");
      const nextTotal = Number(result.total) || 0;
      if (knownParticipantTotal.current !== null && nextTotal > knownParticipantTotal.current) {
        const added = nextTotal - knownParticipantTotal.current;
        showNotification(
          "Peserta baru masuk",
          `${added} pendaftaran baru berhasil diterima. Total peserta sekarang ${numberFormat.format(nextTotal)}.`,
          "success",
        );
      }
      knownParticipantTotal.current = nextTotal;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Data dashboard gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  function showNotification(title: string, message: string, tone: NotificationMessage["tone"]) {
    const id = notificationId.current + 1;
    notificationId.current = id;
    setNotification({ id, title, message, tone });
    window.setTimeout(() => setNotification((current) => current?.id === id ? null : current), 5000);
    if (tone === "success" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  }

  async function enableBrowserNotifications() {
    if (!("Notification" in window)) {
      showNotification("Notifikasi browser tidak tersedia", "Gunakan toast di dashboard untuk melihat event.", "error");
      return;
    }
    const permission = await Notification.requestPermission();
    setBrowserNotificationsEnabled(permission === "granted");
    showNotification(
      permission === "granted" ? "Notifikasi browser aktif" : "Notifikasi browser belum diaktifkan",
      permission === "granted" ? "Anda akan menerima notifikasi saat peserta baru masuk." : "Izinkan notifikasi browser untuk menerima pemberitahuan di luar tab.",
      permission === "granted" ? "success" : "error",
    );
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadData(page), 0);
    const timer = window.setInterval(() => void loadData(page), 10000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [loadData, page]);

  const totalSelections = useMemo(() => data?.stats.reduce((sum, item) => sum + item.total, 0) || 0, [data]);
  const pieGradient = useMemo(() => {
    if (!data || totalSelections === 0) return "conic-gradient(#e7d9c4 0deg 360deg)";
    let cursor = 0;
    const segments = data.stats.map((item, index) => {
      const start = cursor;
      cursor += (item.total / totalSelections) * 360;
      return `${colors[index % colors.length]} ${start}deg ${cursor}deg`;
    });
    return `conic-gradient(${segments.join(",")})`;
  }, [data, totalSelections]);

  async function saveNewOption(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingOption(true);
    setError("");
    try {
      const response = await fetch("/api/admin/opsi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: optionType, label: newLabel }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Opsi gagal ditambahkan.");
      setNewLabel("");
      showNotification("Opsi ditambahkan", `${optionType === "kelas" ? "Kelas" : "Rumpun ilmu"} baru berhasil ditambahkan.`, "success");
      await loadData(page);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Opsi gagal ditambahkan.";
      setError(message);
      showNotification("Opsi gagal ditambahkan", message, "error");
    } finally {
      setSavingOption(false);
    }
  }

  async function updateOption(option: Option, type: "kelas" | "rumpun", changes: { label?: string; active?: boolean }) {
    setError("");
    try {
      const response = await fetch(`/api/admin/opsi/${option.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...changes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Opsi gagal diperbarui.");
      setEditing(null);
      showNotification("Opsi diperbarui", `${type === "kelas" ? "Kelas" : "Rumpun ilmu"} berhasil diperbarui.`, "success");
      await loadData(page);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : "Opsi gagal diperbarui.";
      setError(message);
      showNotification("Opsi gagal diperbarui", message, "error");
    }
  }

  async function deleteOption(option: Option, type: "kelas" | "rumpun") {
    if (!window.confirm(`Hapus opsi “${option.label}”? Data peserta yang sudah memakai opsi ini akan dipertahankan.`)) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/opsi/${option.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Opsi gagal dihapus.");
      showNotification("Opsi dihapus", `${type === "kelas" ? "Kelas" : "Rumpun ilmu"} berhasil dihapus.`, "success");
      await loadData(page);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Opsi gagal dihapus.";
      setError(message);
      showNotification("Opsi gagal dihapus", message, "error");
    }
  }

  async function downloadExcel() {
    setIsDownloading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/pemetaan/export", { cache: "no-store" });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "File Excel gagal dibuat.");
      }

      const file = await response.blob();
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = response.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] || "pemetaan-rumpun-ilmu.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : "File Excel gagal diunduh.");
    } finally {
      setIsDownloading(false);
    }
  }

  const participants = data?.participants || [];
  const stats = data?.stats || [];
  const classOptions = data?.classes || [];
  const rumpunOptions = data?.rumpun || [];
  const leaderboard = [...stats].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)).slice(0, 3);
  const options = optionType === "kelas" ? data?.classes || [] : data?.rumpun || [];
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 50)));

  function startParticipantForm(participant?: Participant) {
    setParticipantForm(participant ? {
      nis: participant.nis,
      nama_lengkap: participant.nama_lengkap,
      kelas: participant.kelas,
      no_wa: participant.no_wa,
      email: participant.email,
      rumpun_ilmu_1: participant.rumpun_ilmu_1,
      rumpun_ilmu_2: participant.rumpun_ilmu_2,
    } : { nis: "", nama_lengkap: "", kelas: "", no_wa: "", email: "", rumpun_ilmu_1: "", rumpun_ilmu_2: "" });
    setError("");
  }

  async function saveParticipant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!participantForm) return;
    setSavingParticipant(true);
    setError("");
    const isEditing = participants.some((participant) => participant.nis === participantForm.nis);
    try {
      const response = await fetch(isEditing ? `/api/admin/pemetaan/${encodeURIComponent(participantForm.nis)}` : "/api/admin/pemetaan", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(participantForm),
      });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Data peserta gagal disimpan.");
      setParticipantForm(null);
      showNotification(isEditing ? "Peserta diperbarui" : "Peserta ditambahkan", isEditing ? "Data peserta berhasil diperbarui." : "Data peserta berhasil ditambahkan.", "success");
      await loadData(page);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Data peserta gagal disimpan.";
      setError(message);
      showNotification("Data peserta gagal disimpan", message, "error");
    } finally {
      setSavingParticipant(false);
    }
  }

  async function deleteParticipant(nis: string) {
    if (!window.confirm(`Hapus data peserta dengan NIS ${nis}?`)) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/pemetaan/${encodeURIComponent(nis)}`, { method: "DELETE" });
      const result = await response.json();
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.error || "Peserta gagal dihapus.");
      showNotification("Peserta dihapus", "Data peserta berhasil dihapus.", "success");
      await loadData(Math.min(page, Math.max(1, Math.ceil(((data?.total || 1) - 1) / (data?.pageSize || 50)))));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Peserta gagal dihapus.";
      setError(message);
      showNotification("Peserta gagal dihapus", message, "error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {notification && (
        <div className={`fixed right-4 top-4 z-[60] w-[min(22rem,calc(100%-2rem))] border-l-4 bg-[#fffcf6] p-4 shadow-xl ${notification.tone === "error" ? "border-red-600" : "border-[#9b5c31]"}`} role="status" aria-live="polite">
          <p className="font-montserrat text-sm font-bold text-[#281311]">{notification.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#655b51]">{notification.message}</p>
          <button type="button" onClick={() => setNotification(null)} className="mt-2 text-xs font-semibold text-[#714526] underline underline-offset-2">Tutup</button>
        </div>
      )}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-kastemo tracking-[0.12em] text-[#9b5c31] uppercase">Ringkasan pendaftaran</p>
          <h1 className="font-montserrat text-3xl font-bold sm:text-4xl">Pemetaan Rumpun Ilmu</h1>
          <p className="mt-2 text-sm text-[#655b51]">Data diperbarui otomatis setiap 10 detik.</p>
        </div>
        <div className="min-w-48 border-2 border-[#9b5c31] bg-[#281311] px-5 py-4 text-center text-[#f0c77c] shadow-lg shadow-[#281311]/15">
          <p className="text-xs font-bold tracking-[0.14em] uppercase">Total peserta</p>
          <p className="mt-1 font-montserrat text-3xl font-bold leading-none sm:text-4xl">{numberFormat.format(data?.total || 0)}</p>
          <p className="mt-2 text-xs text-[#f4ecdc]/80">{updatedAt ? `Sinkron ${dateFormat.format(updatedAt)}` : "Menghubungkan…"}</p>
        </div>
      </div>

      {error && <div role="alert" className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{error}</div>}
      {loading && !data ? (
        <div className="grid min-h-64 place-items-center text-[#655b51]">Memuat data dashboard…</div>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
            <article className="border border-[#281311]/10 bg-[#fffcf6] p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h2 className="font-montserrat text-xl font-bold">Total pilihan rumpun</h2>
                <p className="mt-1 text-sm text-[#655b51]">Jumlah seluruh pilihan pertama dan kedua.</p>
              </div>
              <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <div className="relative size-52 shrink-0 rounded-full" style={{ background: pieGradient }} role="img" aria-label="Diagram pie pilihan rumpun ilmu">
                  <div className="absolute inset-8 grid place-content-center rounded-full bg-[#fffcf6] text-center">
                    <strong className="font-montserrat text-3xl">{numberFormat.format(totalSelections)}</strong>
                    <span className="text-xs text-[#655b51]">total pilihan</span>
                  </div>
                </div>
                <div className="grid w-full gap-2 sm:grid-cols-2">
                  {stats.map((item, index) => (
                    <div key={item.label} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="min-w-0 flex-1 text-[#51463b]">{item.label}</span>
                      <strong>{numberFormat.format(item.total)}</strong>
                    </div>
                  ))}
                  {stats.length === 0 && <p className="text-sm text-[#655b51]">Belum ada opsi rumpun ilmu.</p>}
                </div>
              </div>

              <div className="mt-8 border-t border-[#281311]/10 pt-6">
                <h3 className="mb-4 font-montserrat text-base font-bold">Rincian pilihan 1 dan pilihan 2</h3>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {stats.map((item) => {
                    const firstAngle = item.total ? (item.pilihan_1 / item.total) * 360 : 0;
                    return (
                      <div key={item.label} className="flex items-center gap-3 border border-[#281311]/10 p-3">
                        <div
                          className="relative size-14 shrink-0 rounded-full"
                          style={{ background: `conic-gradient(#9b5c31 0deg ${firstAngle}deg, #e7d9c4 ${firstAngle}deg 360deg)` }}
                          role="img"
                          aria-label={`${item.label}: pilihan pertama ${item.pilihan_1}, pilihan kedua ${item.pilihan_2}`}
                        >
                          <span className="absolute inset-2 rounded-full bg-[#fffcf6]" />
                        </div>
                        <div className="min-w-0 text-xs">
                          <p className="truncate font-semibold text-[#281311]">{item.label}</p>
                          <p className="mt-1 text-[#655b51]">P1 <b className="text-[#281311]">{numberFormat.format(item.pilihan_1)}</b> · P2 <b className="text-[#281311]">{numberFormat.format(item.pilihan_2)}</b></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-4 text-xs text-[#655b51]">
                  <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#9b5c31]" />Pilihan 1</span>
                  <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-[#e7d9c4]" />Pilihan 2</span>
                </div>
              </div>
            </article>

            <article className="border border-[#281311]/10 bg-[#fffcf6] p-5 shadow-sm sm:p-7">
              <p className="mb-2 font-kastemo tracking-[0.1em] text-[#9b5c31] uppercase">Paling diminati</p>
              <h2 className="font-montserrat text-xl font-bold">Top 3 rumpun</h2>
              <ol className="mt-6 grid gap-3">
                {leaderboard.map((item, index) => (
                  <li key={item.label} className="flex items-center gap-4 border border-[#281311]/10 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#281311] font-montserrat font-bold text-[#f0c77c]">{index + 1}</span>
                    <span className="min-w-0 flex-1 font-semibold">{item.label}</span>
                    <strong className="font-montserrat text-xl">{numberFormat.format(item.total)}</strong>
                  </li>
                ))}
                {leaderboard.length === 0 && <li className="text-sm text-[#655b51]">Belum ada data pilihan.</li>}
              </ol>
              <p className="mt-4 text-xs text-[#776a5e]">Peringkat berdasarkan gabungan pilihan 1 dan 2.</p>
            </article>
          </section>

          <section className="mt-8 border border-[#281311]/10 bg-[#fffcf6] shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#281311]/10 p-5 sm:p-7">
              <div>
                <h2 className="font-montserrat text-xl font-bold">Data peserta</h2>
                <p className="mt-1 text-sm text-[#655b51]">Daftar pendaftar terbaru · refresh otomatis 10 detik</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => startParticipantForm()} className="border border-[#281311] px-3 py-2 text-sm font-semibold hover:bg-[#f4ecdc]">Tambah peserta</button>
                {!browserNotificationsEnabled && <button type="button" onClick={() => void enableBrowserNotifications()} className="border border-[#9b5c31] px-3 py-2 text-sm font-semibold text-[#714526] hover:bg-[#f4ecdc]">Aktifkan notifikasi</button>}
                <button type="button" onClick={() => void downloadExcel()} disabled={isDownloading} className="border border-[#281311] bg-[#281311] px-3 py-2 text-sm font-semibold text-[#f0c77c] hover:bg-[#f0c77c] hover:text-[#281311] disabled:cursor-wait disabled:opacity-60">
                  {isDownloading ? "Menyiapkan Excel…" : "Unduh Excel"}
                </button>
                <button type="button" onClick={() => void loadData(page, true)} className="border border-[#281311]/25 px-3 py-2 text-sm font-semibold hover:bg-[#f4ecdc]">Segarkan</button>
              </div>
            </div>
            {participantForm && (
              <form onSubmit={saveParticipant} className="grid gap-4 border-b border-[#281311]/10 bg-[#f4ecdc]/45 p-5 sm:grid-cols-2 sm:p-7">
                <h3 className="sm:col-span-2 font-montserrat font-bold">{participants.some((participant) => participant.nis === participantForm.nis) ? "Edit peserta" : "Tambah peserta"}</h3>
                {([
                  ["nis", "NIS", "text"],
                  ["nama_lengkap", "Nama lengkap", "text"],
                  ["no_wa", "Nomor WhatsApp", "tel"],
                  ["email", "Email", "email"],
                ] as const).map(([key, label, type]) => (
                  <label key={key} className="grid gap-1 text-sm font-semibold">
                    {label}
                    <input required type={type} disabled={key === "nis" && participants.some((participant) => participant.nis === participantForm.nis)} value={participantForm[key]} onChange={(event) => setParticipantForm({ ...participantForm, [key]: event.target.value })} className="min-h-10 border border-[#d7cbbb] bg-white px-3 py-2 font-normal" />
                  </label>
                ))}
                {([
                  ["kelas", "Kelas", classOptions],
                  ["rumpun_ilmu_1", "Pilihan 1", rumpunOptions],
                  ["rumpun_ilmu_2", "Pilihan 2", rumpunOptions],
                ] as const).map(([key, label, options]) => (
                  <label key={key} className="grid gap-1 text-sm font-semibold">
                    {label}
                    <select required value={participantForm[key]} onChange={(event) => setParticipantForm({ ...participantForm, [key]: event.target.value })} className="min-h-10 border border-[#d7cbbb] bg-white px-3 py-2 font-normal">
                      <option value="" disabled>Pilih {label.toLowerCase()}</option>
                      {options.filter((option) => option.active || option.label === participantForm[key]).map((option) => <option key={option.id} value={option.label}>{option.label}</option>)}
                    </select>
                  </label>
                ))}
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" disabled={savingParticipant} className="bg-[#281311] px-4 py-2 text-sm font-semibold text-[#f0c77c] disabled:opacity-60">{savingParticipant ? "Menyimpan…" : "Simpan"}</button>
                  <button type="button" onClick={() => setParticipantForm(null)} className="border border-[#281311]/25 px-4 py-2 text-sm font-semibold">Batal</button>
                </div>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="bg-[#f4ecdc] text-xs uppercase tracking-wide text-[#655b51]">
                  <tr>{["NIS", "Nama", "Kelas", "WhatsApp", "Email", "Pilihan 1", "Pilihan 2", "Pas foto", "Waktu daftar", "Aksi"].map((heading) => <th key={heading} className="px-4 py-3 font-semibold">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#281311]/10">
                  {participants.map((person) => (
                    <tr key={person.nis} className="align-top hover:bg-[#f4ecdc]/50">
                      <td className="px-4 py-3 font-mono text-xs">{person.nis}</td>
                      <td className="px-4 py-3 font-semibold">{person.nama_lengkap}</td>
                      <td className="px-4 py-3">{person.kelas}</td>
                      <td className="px-4 py-3">{person.no_wa}</td>
                      <td className="px-4 py-3">{person.email}</td>
                      <td className="max-w-48 px-4 py-3">{person.rumpun_ilmu_1}</td>
                      <td className="max-w-48 px-4 py-3">{person.rumpun_ilmu_2}</td>
                      <td className="px-4 py-3">{person.pas_foto ? <a href={`/api/admin/foto?nis=${encodeURIComponent(person.nis)}`} target="_blank" rel="noreferrer" className="font-semibold text-[#714526] underline underline-offset-2">Lihat</a> : "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-[#655b51]">{dateFormat.format(new Date(person.created_at))}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startParticipantForm(person)} className="font-semibold text-[#714526] underline underline-offset-2">Edit</button>
                          <button type="button" onClick={() => void deleteParticipant(person.nis)} className="font-semibold text-[#a33126] underline underline-offset-2">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!participants.length && <tr><td colSpan={10} className="px-4 py-10 text-center text-[#655b51]">Belum ada peserta terdaftar.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#281311]/10 px-5 py-4 text-sm">
              <span className="text-[#655b51]">Halaman {page} dari {totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="border border-[#281311]/20 px-3 py-2 disabled:opacity-40">Sebelumnya</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="border border-[#281311]/20 px-3 py-2 disabled:opacity-40">Berikutnya</button>
              </div>
            </div>
          </section>

          <section className="mt-8 border border-[#281311]/10 bg-[#fffcf6] p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 font-kastemo tracking-[0.1em] text-[#9b5c31] uppercase">Pengaturan formulir</p>
                <h2 className="font-montserrat text-xl font-bold">Opsi kelas dan rumpun ilmu</h2>
              </div>
              <div className="flex border border-[#281311]/15 p-1">
                <button type="button" onClick={() => { setOptionType("kelas"); setEditing(null); }} className={`px-4 py-2 text-sm font-semibold ${optionType === "kelas" ? "bg-[#281311] text-[#f0c77c]" : "text-[#51463b]"}`}>Kelas</button>
                <button type="button" onClick={() => { setOptionType("rumpun"); setEditing(null); }} className={`px-4 py-2 text-sm font-semibold ${optionType === "rumpun" ? "bg-[#281311] text-[#f0c77c]" : "text-[#51463b]"}`}>Rumpun ilmu</button>
              </div>
            </div>

            <form onSubmit={saveNewOption} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} maxLength={optionType === "kelas" ? 40 : 100} required placeholder={optionType === "kelas" ? "Nama kelas baru" : "Nama rumpun baru"} className="min-h-11 min-w-0 flex-1 border border-[#d7cbbb] bg-white px-3 py-2" />
              <button disabled={savingOption} className="min-h-11 bg-[#281311] px-5 py-2 font-semibold text-[#f0c77c] disabled:opacity-60">{savingOption ? "Menyimpan…" : "Tambah opsi"}</button>
            </form>

            <div className="mt-5 divide-y divide-[#281311]/10 border-y border-[#281311]/10">
              {options.map((option) => (
                <div key={option.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  {editing?.id === option.id ? (
                    <>
                      <input value={editing.label} onChange={(event) => setEditing({ ...editing, label: event.target.value })} maxLength={optionType === "kelas" ? 40 : 100} className="min-h-10 min-w-0 flex-1 border border-[#d7cbbb] px-3 py-2" aria-label="Nama opsi baru" />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => void updateOption(option, optionType, { label: editing.label })} className="border border-[#281311] px-3 py-2 text-sm font-semibold">Simpan</button>
                        <button type="button" onClick={() => setEditing(null)} className="px-3 py-2 text-sm text-[#655b51]">Batal</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className={`min-w-0 flex-1 font-medium ${option.active ? "" : "text-[#8b8278] line-through"}`}>{option.label}</span>
                      <span className={`text-xs font-semibold ${option.active ? "text-emerald-700" : "text-[#8b8278]"}`}>{option.active ? "Aktif" : "Nonaktif"}</span>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setEditing({ id: option.id, label: option.label })} className="border border-[#281311]/20 px-3 py-2 text-sm hover:bg-[#f4ecdc]">Ubah</button>
                        <button type="button" onClick={() => void updateOption(option, optionType, { active: !option.active })} className="border border-[#281311]/20 px-3 py-2 text-sm hover:bg-[#f4ecdc]">{option.active ? "Nonaktifkan" : "Aktifkan"}</button>
                        <button type="button" onClick={() => void deleteOption(option, optionType)} className="border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50">Hapus</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {!options.length && <p className="py-6 text-sm text-[#655b51]">Belum ada opsi {optionType === "kelas" ? "kelas" : "rumpun ilmu"}.</p>}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#776a5e]">Opsi yang sudah dipakai peserta tidak dapat dihapus permanen. Nonaktifkan opsi agar tidak muncul lagi pada formulir tanpa mengubah data lama.</p>
          </section>
        </>
      )}
    </div>
  );
}
