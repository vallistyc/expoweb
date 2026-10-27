import { div } from "motion/react-client";
import Image from "next/image";
import { CardSpotlight } from "@/components/ui/card-spotlight";

type PemateriCard = {
    src: string
    width?: number
    height?: number
    alt: string
}

export default function CardPemateri({ src, width, height, alt, }: PemateriCard) {
    return (
        <>
        <CardSpotlight className="h-fit" color="#fff" radius={200}>
            <Image
                src={src}
                alt={alt}
                width={width ?? 100}
                height={height ?? 300}
                className="flex items-center justify-center w-90"
            />
        </CardSpotlight>
        </>
    )
}