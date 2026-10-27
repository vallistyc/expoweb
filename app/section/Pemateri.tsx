import { createSupabaseServerClient } from "../lib/supabase-server";
import PemateriCarousel, {type CarouselItem} from "../component/PemateriCarousel";

const BUCKET = "pemateri";

type PemateriRow = {
    id_pemateri: string;
    nama_pemateri: string;
    jenis: string;
    foto: string | null;
    uraian: string;
};

export default async function Pemateri() {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
        return <p>Gagal menghubungkan ke database, periksa Environment Variables</p>;
    }

    const { data, error } = await supabase
        .schema("expoweb")
        .from("pemateri")
        .select("id_pemateri, nama_pemateri, jenis, foto, uraian");
    // Urutan belum dijamin. Kalau perlu urutan tertentu, tambah kolom "urutan"
    // di tabel lalu pakai: .order("urutan")

    if (error) {
        return (
            <p className="text-red-500 text-center">
                Gagal mengambil data dari database: {error.message}
            </p>
        );
    }

    // Kolom "foto" boleh berisi URL lengkap, path "/...", atau nama file di bucket
    function resolveFotoSrc(foto: string | null) {
        const value = foto?.trim();
        if (!value) return null;

        if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;

        return supabase!.storage.from(BUCKET).getPublicUrl(value).data.publicUrl;
    }

    const items: CarouselItem[] = ((data ?? []) as PemateriRow[]).flatMap((row) => {
        const src = resolveFotoSrc(row.foto);
        return src
            ? [{ id: row.id_pemateri, src, alt: row.nama_pemateri }]
            : [];
    });

    return (
        <section className="relative flex flex-col justify-center h-screen items-center py-25">
            <h4 className="font-kastemo text-5xl text-[#EEC57A]">
                MENGUNDANG
            </h4>
            <h3 className="flex flex-col text-center line-height-0 pb-15 bg-linear-to-r from-[#5A3A00] via-[#EF9A00] to-[#5A3A00] bg-clip-text text-8xl font-arexa leading-none text-transparent">
                PEMATERI HEBAT
            </h3>

            <div className="mt-8 w-full">
                <PemateriCarousel items={items} tone="light" className="w-150" />
            </div>
        </section>
    );
}