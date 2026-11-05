import ArticleCard from "./ArticleCard";
import {createSupabaseServerClient} from "../lib/supabase-server";

type Articles = {
    id: string
    title: string
    slug: string
    thumbnail: string
    published_at: string
}

export default async function ArticlesPage() {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
        return <p>Gagal menghubungkan ke database, periksa Environment Variables</p>;
    }

    const {data, error} = await supabase
    .schema("expoweb")
    .from("articles")
    .select("id, title, slug, thumbnail, published_at")
    .eq("status", "published")
    .order("published_at", {ascending: true})

    if (error) {
        return <p className="text-red-500 text-center">Gagal mengambil data dari database: {error.message}</p>;
    }

    const listArticles = (data ?? []) as Articles[];

    if (listArticles.length === 0) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#080808] px-6">
                <p className="text-center text-xl text-white/60">Belum ada artikel nih.</p>
            </div>
        )
    }
    
    return (
        <main className="min-h-screen bg-[#080808] px-5 py-20 text-white sm:px-8 lg:px-12">
            <header className="mx-auto mb-12 max-w-7xl flex flex-col text-center justify-center items-center">
                <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#EEC57A]">
                    Cerita terbaru
                </p>
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                    <h1 className="max-w-2xl font-arexa text-5xl leading-[0.95] text-[#EEC57A] sm:text-7xl">
                        Kabar Terkini
                    </h1>
                    <p className="max-w-sm text-sm leading-6 text-white/50">
                        Temukan cerita, kabar, dan informasi terbaru dari Expo Campus.
                    </p>
                </div>
            </header>
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listArticles.map((article)=>(
                    <ArticleCard 
                    key={article.id}
                    title={article.title}
                    slug={article.slug} 
                    thumbnail={article.thumbnail}
                    published={article.published_at}
                    />
                ))}
            </div>
        </main>
    )
}