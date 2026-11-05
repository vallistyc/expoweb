import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase-server";

type Program = {
    id: string;
    nama: string;
    deskripsi: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    tujuan: string;
    manfaat: string;
    peserta: string;
    thumbnail: string | null;
    id_images: string | null;
    urutan: number | null;
    slug: string | null;
    pilar: string | null;
};

type ProgramPageProps = {
    params: Promise<{ slug: string }>;
};

async function getProgram(slug: string) {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
        return { program: null, error: "Database belum dikonfigurasi." };
    }

    const { data, error } = await supabase
        .schema("expoweb")
        .from("program")
        .select(
            "id, nama, deskripsi, tanggal, waktu, lokasi, tujuan, manfaat, peserta, thumbnail, id_images, urutan, slug, pilar"
        )
        .eq("slug", slug)
        .maybeSingle();

    if (error) {
        return { program: null, error: error.message };
    }

    return { program: data as Program | null, error: null };
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(time: string) {
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
}

function formatMultilineText(value: string) {
    return value.replace(/\\n|\/n/g, "\n");
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
    const { slug } = await params;
    const { program } = await getProgram(slug);

    return {
        title: program ? `${program.nama} | EXCAMP 27` : "Program | EXCAMP 27",
        description: program?.deskripsi || "Detail program Expo Campus.",
    };
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
    const { slug } = await params;
    const { program, error } = await getProgram(slug);

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-center text-red-300">
                Gagal memuat program: {error}
            </main>
        );
    }

    if (!program) notFound();

    const thumbnail = program.thumbnail || "/thumbnail-ph.webp";
    const description = formatMultilineText(program.deskripsi);
    const purpose = formatMultilineText(program.tujuan);
    const benefits = formatMultilineText(program.manfaat);

    return (
        <main className="min-h-screen bg-[#080808] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12">
            <article className="mx-auto max-w-6xl">
                <Link
                    href="/program"
                    className="mb-10 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#EEC57A]"
                >
                    <span aria-hidden="true">←</span> Kembali ke program
                </Link>

                <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                        <Image
                            src={thumbnail}
                            alt={program.nama}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 55vw"
                            className="object-cover"
                        />
                    </div>

                    <div>
                        {program.pilar && (
                            <p className="font-arexa text-3xl text-[#EEC57A]">{program.pilar}</p>
                        )}
                        <h1 className="mt-2 font-montserrat text-4xl font-bold leading-tight text-white sm:text-6xl">
                            {program.nama}
                        </h1>
                        <p className="mt-6 whitespace-pre-line text-base leading-7 text-white/70">
                            {description}
                        </p>

                        <dl className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EEC57A]">
                                    Tanggal
                                </dt>
                                <dd className="mt-1 text-white/80">{formatDate(program.tanggal)}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EEC57A]">
                                    Waktu
                                </dt>
                                <dd className="mt-1 text-white/80">{formatTime(program.waktu)} WIB</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EEC57A]">
                                    Lokasi
                                </dt>
                                <dd className="mt-1 text-white/80">{program.lokasi}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EEC57A]">
                                    Peserta
                                </dt>
                                <dd className="mt-1 capitalize text-white/80">{program.peserta}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="mt-16 grid gap-8 md:grid-cols-2">
                    <section className="border-l-2 border-[#EEC57A] pl-6">
                        <h2 className="font-montserrat text-2xl font-bold text-[#EEC57A]">Tujuan</h2>
                        <p className="mt-4 whitespace-pre-line leading-8 text-white/70">{purpose}</p>
                    </section>
                    <section className="border-l-2 border-[#EEC57A] pl-6">
                        <h2 className="font-montserrat text-2xl font-bold text-[#EEC57A]">Manfaat</h2>
                        <p className="mt-4 whitespace-pre-line leading-8 text-white/70">{benefits}</p>
                    </section>
                </div>
            </article>
        </main>
    );
}
