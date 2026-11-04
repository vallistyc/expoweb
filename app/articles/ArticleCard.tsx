import { button, div } from "motion/react-client";
import Image from "next/image";

type ArticleCardProps = {
    slug: string,
    title: string,
    thumbnail: string,
    published: string,
}

export default function ArticleCard({slug, title, published, thumbnail}:ArticleCardProps) {
    return(
        <button className="bg-white flex flex-col justify-center items-center w-10/11 cursor-pointer">
            <Image 
            src={thumbnail}
            alt={slug}
            width={500}
            height={300}
            className="w-full"
            />

            <div className="flex flex-col items-start p-5">
                <h2 className="text-2xl font-bold text-left pb-1 font-poppins">
                    {title}
                </h2>

                <p className="pb-5">
                    {published}
                </p>

                <button className="cursor-pointer">
                    Baca Lebih Lanjut
                </button>
            </div>
        </button>
    )
}