import Image from "next/image";
import Link from "next/link";

type ArticleCardProps = {
    id: string,
    title: string,
    thumbnail: string,
    published: string,
}

export default function ArticleCard({id, title, published, thumbnail}:ArticleCardProps) {
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(published));

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#EEC57A]/50 hover:bg-white/[0.1]">
            <Link href={`/articles/${id}`} className="flex h-full flex-col">
                <div className="relative aspect-[16/10] overflow-hidden bg-white/10">
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col items-start p-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-[#EEC57A]">
                        {formattedDate}
                    </p>
                    <h2 className="line-clamp-2 text-xl font-semibold leading-tight text-white transition group-hover:text-[#EEC57A] sm:text-2xl">
                        {title}
                    </h2>
                    <span className="mt-auto pt-8 text-sm font-medium text-white/60 transition group-hover:text-[#EEC57A]">
                        Baca selengkapnya <span aria-hidden="true">→</span>
                    </span>
                </div>
            </Link>
        </article>
    );
}