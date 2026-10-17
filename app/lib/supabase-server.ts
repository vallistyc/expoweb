import "server-only";

export type SupabaseServerConfig = {
  baseUrl: string;
  serviceKey: string;
  submissionsTable: string;
  classesTable: string;
  rumpunTable: string;
  statsView: string;
  bucket: string;
};

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const config = {
    baseUrl,
    serviceKey,
    submissionsTable: process.env.SUPABASE_CONCENTRATION_TABLE || "pemetaan_rumpun_ilmu",
    classesTable: process.env.SUPABASE_CLASSES_TABLE || "opsi_kelas",
    rumpunTable: process.env.SUPABASE_RUMPUN_TABLE || "opsi_rumpun_ilmu",
    statsView: "pemetaan_rumpun_stats",
    bucket: process.env.SUPABASE_PHOTO_BUCKET || "pas-foto-pemetaan",
  };

  if (!baseUrl || !serviceKey) return null;
  if (![config.submissionsTable, config.classesTable, config.rumpunTable, config.statsView, config.bucket]
    .every((value) => /^[a-zA-Z0-9_-]+$/.test(value))) return null;

  return config as SupabaseServerConfig;
}

export function supabaseHeaders(serviceKey: string, extra: Record<string, string> = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    ...extra,
  };
}

export function supabaseTableUrl(baseUrl: string, table: string, query?: URLSearchParams) {
  return `${baseUrl}/rest/v1/${table}${query?.size ? `?${query.toString()}` : ""}`;
}
