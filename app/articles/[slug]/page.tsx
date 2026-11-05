import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase-server";

type Article = {
    id: string;
    title: string;
    slug: string;
    thumbnail: string;
    content: string | null;
    status: string;
    published_at: string;
};

type ArticlePageProps = {
    params: Promise<{ slug: string }>;
};

export const instant = false;

async function getArticle(slug: string) {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
        return { article: null, error: "Database belum dikonfigurasi." };
    }

    const { data, error } = await supabase
        .schema("expoweb")
        .from("articles")
        .select("id, title, slug, thumbnail, content, status, published_at")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
        return { article: null, error: error.message };
    }

    return { article: data as Article | null, error: null };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { slug } = await params;
    const { article } = await getArticle(slug);

    return {
        title: article ? `${article.title} | EXCAMP 27` : "Artikel | EXCAMP 27",
        description: article?.title || "Artikel terbaru dari Expo Campus.",
    };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
    const { slug } = await params;
    const { article, error } = await getArticle(slug);

    if (error) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-center text-red-300">
                Gagal memuat artikel: {error}
            </main>
        );
    }

    if (!article) notFound();

    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(article.published_at));
    const formattedContent = article.content?.replace(/\\n|\/n/g, "\n");

    return (
        <main className="min-h-screen bg-[#080808] px-5 pb-20 pt-32 text-white sm:px-8 lg:px-12">
            <article className="mx-auto max-w-5xl">
                <Link
                    href="/articles"
                    className="mb-10 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-[#EEC57A]"
                >
                    <span aria-hidden="true">←</span> Kembali ke artikel
                </Link>

                <h1 className="mx-auto max-w-3xl text-center font-poppins text-3xl font-bold leading-tight text-[#EEC57A] sm:text-5xl">
                    {article.title}
                </h1>
                <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                    {formattedDate}
                </p>

                <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                    <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        className="object-cover"
                    />
                </div>

                <div className="mx-auto mt-10 max-w-3xl border-l-2 border-[#EEC57A] pl-6 text-lg leading-8 text-white/70">
                    <p className="whitespace-pre-line">
                        {formattedContent || "Informasi lengkap mengenai artikel ini akan segera tersedia."}
                    </p>
                </div>
            </article>
        </main>
    );
}