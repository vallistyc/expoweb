import Link from "next/link";
import Image from "next/image";
import {MoveRight} from "lucide-react";

type ProgramCard = {
    src: string
    alt: string
    slug: string
    pilar: string
    nama: string
}

export default function ProgramCard({src, alt, slug, pilar,nama}: ProgramCard) {
    return (
        <article className="overflow-hidden shadow-lg">
            <Image 
            src={src || "/thumbnail-ph.webp"}
            alt={alt}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
            />

            <div className="flex flex-row justify-between items-center pt-5">
                <div className="flex flex-col gap-3">
                    <p className="text-3xl text-[#EEC57A]">
                        {pilar}
                    </p>

                    <h2 className="text-4xl font-montserrat font-bold">
                        {nama}
                    </h2> 
                </div>

                <Link href={`/program/${slug}`} aria-label={`Lihat detail ${nama}`} className="bg-orange-400 font-arexa text-2xl p-5 h-full hover:bg-orange-500">
                    <MoveRight className="w-10 h-10 text-black hover:-rotate-45 ease-in-out duration-300"/>
                </Link>

            </div>
        </article>
    )
}