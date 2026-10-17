import { isAdminAuthenticated } from "@/app/lib/require-admin";
import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";
import { createXlsx } from "@/app/lib/xlsx-export";

const PAGE_SIZE = 1000;
const MAX_EXCEL_DATA_ROWS = 1_048_575;
const COLUMNS = [
  "NIS",
  "Nama lengkap",
  "Kelas",
  "Nomor WhatsApp",
  "Email",
  "Pas foto (path storage)",
  "Rumpun ilmu pilihan 1",
  "Rumpun ilmu pilihan 2",
  "Waktu daftar",
];

type ParticipantRow = {
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

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sesi admin tidak valid." }, { status: 401 });
  const config = getSupabaseServerConfig();
  if (!config) return Response.json({ error: "Database belum dikonfigurasi." }, { status: 503 });

  const query = new URLSearchParams({
    select: "nis,nama_lengkap,kelas,no_wa,email,pas_foto,rumpun_ilmu_1,rumpun_ilmu_2,created_at",
    order: "nis.asc",
  });
  const records: ParticipantRow[] = [];
  let afterNis = "";

  try {
    for (;;) {
      if (afterNis) query.set("nis", `gt.${afterNis}`);
      const response = await fetch(supabaseTableUrl(config.baseUrl, config.submissionsTable, query), {
        headers: {
          ...supabaseHeaders(config.serviceKey),
          Range: `0-${PAGE_SIZE - 1}`,
          "Range-Unit": "items",
        },
        cache: "no-store",
      });
      if (!response.ok) return Response.json({ error: "Gagal membaca seluruh data peserta dari database." }, { status: 502 });

      const batch = await response.json() as ParticipantRow[];
      records.push(...batch);
      if (records.length > MAX_EXCEL_DATA_ROWS) {
        return Response.json({ error: "Jumlah data melebihi batas baris satu file Excel." }, { status: 413 });
      }
      if (batch.length === 0) break;
      afterNis = batch[batch.length - 1].nis;
    }

    const rows = records.map((record) => [
      record.nis,
      record.nama_lengkap,
      record.kelas,
      record.no_wa,
      record.email,
      record.pas_foto,
      record.rumpun_ilmu_1,
      record.rumpun_ilmu_2,
      record.created_at,
    ]);
    const file = createXlsx(COLUMNS, rows);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="pemetaan-rumpun-ilmu-${date}.xlsx"`,
        "Content-Length": String(file.length),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Tidak dapat membuat file Excel dari database." }, { status: 502 });
  }
}
