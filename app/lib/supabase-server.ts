import "server-only";
import { createClient } from "@supabase/supabase-js";

export type SupabaseServerConfig = {
  baseUrl: string;
  serviceKey: string;
};

export type PemetaanSupabaseConfig = SupabaseServerConfig & {
  submissionsTable: string;
  classesTable: string;
  rumpunTable: string;
  statsView: string;
  bucket: string;
};

export function getSupabaseServerConfig(): SupabaseServerConfig | null {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !serviceKey) return null;

  return { baseUrl, serviceKey };
}

export function createSupabaseServerClient() {
  const config = getSupabaseServerConfig();
  if (!config) return null;

  return createClient(config.baseUrl, config.serviceKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export function getPemetaanSupabaseConfig(): PemetaanSupabaseConfig | null {
  const config = getSupabaseServerConfig();
  if (!config) return null;

  const pemetaanConfig = {
    ...config,
    submissionsTable: process.env.SUPABASE_CONCENTRATION_TABLE || "pemetaan_rumpun_ilmu",
    classesTable: process.env.SUPABASE_CLASSES_TABLE || "opsi_kelas",
    rumpunTable: process.env.SUPABASE_RUMPUN_TABLE || "opsi_rumpun_ilmu",
    statsView: "pemetaan_rumpun_stats",
    bucket: process.env.SUPABASE_PHOTO_BUCKET || "pas-foto-pemetaan",
  };

  if (![pemetaanConfig.submissionsTable, pemetaanConfig.classesTable, pemetaanConfig.rumpunTable, pemetaanConfig.statsView, pemetaanConfig.bucket]
    .every((value) => /^[a-zA-Z0-9_-]+$/.test(value))) return null;

  return pemetaanConfig;
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
