import { getSupabaseServerConfig, supabaseHeaders, supabaseTableUrl } from "@/app/lib/supabase-server";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

function safeErrorMessage(body: string) {
  try {
    const parsed = JSON.parse(body) as { code?: string };
    if (parsed.code === "23505") return "NIS ini sudah pernah mengirim formulir.";
    return "Terjadi kendala saat menyimpan data.";
  } catch {
    return "Terjadi kendala saat menyimpan data.";
  }
}

function isUniqueViolation(body: string) {
  try {
    return (JSON.parse(body) as { code?: string }).code === "23505";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const config = getSupabaseServerConfig();
  if (!config) {
    return jsonError("Koneksi Supabase belum dikonfigurasi dengan benar.", 500);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Data formulir tidak dapat dibaca.", 400);
  }

  const field = (name: string) => String(formData.get(name) || "").trim();
  const nis = field("nis");
  const namaLengkap = field("nama_lengkap");
  const kelas = field("kelas");
  const noWa = field("no_wa");
  const email = field("email");
  const rumpun1 = field("rumpun_ilmu_1");
  const rumpun2 = field("rumpun_ilmu_2");
  const photoValue = formData.get("pas_foto");
  const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;

  if (!nis || !namaLengkap || !kelas || !noWa || !email || !rumpun1 || !rumpun2) {
    return jsonError("Lengkapi semua data wajib sebelum mengirim.", 400);
  }
  if (!/^\d{1,30}$/.test(nis)) {
    return jsonError("NIS harus berupa angka dengan maksimal 30 digit.", 400);
  }
  if (nis.length > 30 || namaLengkap.length > 120 || kelas.length > 40 || noWa.length > 25 || email.length > 254) {
    return jsonError("Ada data yang melebihi batas panjang yang diizinkan.", 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Format email tidak valid.", 400);
  }
  if (rumpun1 === rumpun2) {
    return jsonError("Pilih dua rumpun ilmu yang berbeda.", 400);
  }
  if (photo && (!photo.type.match(/^image\/(jpeg|png|webp)$/) || photo.size > 5 * 1024 * 1024)) {
    return jsonError("Pas foto harus berupa JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.", 400);
  }

  const { baseUrl, serviceKey, submissionsTable, classesTable, rumpunTable, bucket } = config;

  const optionQuery = (label: string) => new URLSearchParams({
    select: "label",
    label: `eq.${label}`,
    active: "eq.true",
    limit: "1",
  });
  let optionResponses: Response[];
  try {
    optionResponses = await Promise.all([
      fetch(supabaseTableUrl(baseUrl, classesTable, optionQuery(kelas)), { headers: supabaseHeaders(serviceKey), cache: "no-store" }),
      fetch(supabaseTableUrl(baseUrl, rumpunTable, optionQuery(rumpun1)), { headers: supabaseHeaders(serviceKey), cache: "no-store" }),
      fetch(supabaseTableUrl(baseUrl, rumpunTable, optionQuery(rumpun2)), { headers: supabaseHeaders(serviceKey), cache: "no-store" }),
    ]);
  } catch {
    return jsonError("Tidak dapat memeriksa opsi kelas dan rumpun ilmu.", 502);
  }
  if (optionResponses.some((response) => !response.ok)) {
    return jsonError("Pemeriksaan opsi formulir gagal.", 502);
  }
  const optionRows = await Promise.all(optionResponses.map((response) => response.json())) as Array<Array<{ label: string }>>;
  if (optionRows.some((rows) => rows.length === 0)) {
    return jsonError("Pilih kelas dan rumpun ilmu yang masih aktif.", 400);
  }
  let uploadedPath: string | null = null;
  if (photo) {
    const extension = photo.type === "image/jpeg" ? "jpg" : photo.type === "image/png" ? "png" : "webp";
    uploadedPath = `${nis}/${crypto.randomUUID()}.${extension}`;
    const encodedPath = uploadedPath.split("/").map(encodeURIComponent).join("/");
    let uploadResponse: Response;
    try {
      uploadResponse = await fetch(`${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
        method: "POST",
        headers: supabaseHeaders(serviceKey, {
          "Content-Type": photo.type,
          "x-upsert": "false",
        }),
        body: await photo.arrayBuffer(),
      });
    } catch {
      return jsonError("Pas foto gagal diunggah. Silakan coba lagi.", 502);
    }
    if (!uploadResponse.ok) {
      return jsonError(`Pas foto gagal diunggah: ${safeErrorMessage(await uploadResponse.text())}`, 502);
    }
  }

  const submission = {
    nis,
    nama_lengkap: namaLengkap,
    kelas,
    no_wa: noWa,
    email,
    pas_foto: uploadedPath,
    rumpun_ilmu_1: rumpun1,
    rumpun_ilmu_2: rumpun2,
  };

  let insertResponse: Response;
  try {
    insertResponse = await fetch(`${baseUrl}/rest/v1/${submissionsTable}`, {
      method: "POST",
      headers: supabaseHeaders(serviceKey, {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify(submission),
    });
  } catch {
    insertResponse = new Response(null, { status: 502 });
  }

  if (!insertResponse.ok) {
    if (uploadedPath) {
      const encodedPath = uploadedPath.split("/").map(encodeURIComponent).join("/");
      await fetch(`${baseUrl}/storage/v1/object/${bucket}/${encodedPath}`, {
        method: "DELETE",
        headers: supabaseHeaders(serviceKey),
      }).catch(() => undefined);
    }
    const body = insertResponse.status === 502 ? "" : await insertResponse.text();
    if (isUniqueViolation(body)) {
      return jsonError("NIS ini sudah pernah mengirim formulir.", 409);
    }
    return jsonError(safeErrorMessage(body), insertResponse.status === 409 ? 409 : 500);
  }

  return Response.json({ ok: true });
}
