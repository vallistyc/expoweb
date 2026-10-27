import Image from "next/image";

type LembagaProps = {
    src: string,
    alt: string,
}

export default function LogoLembaga({ src, alt }: LembagaProps) {
    return (
        <Image 
        src={src}
        alt={alt}
        width={500}
        height={500}
        className="flex items-center justify-center w-70 rounded-full"
        />
    )
}