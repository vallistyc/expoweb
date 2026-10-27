import Image from "next/image";

type KampusLogoProps = {
    src: string,
    alt: string,
    width: number
    height: number
}

export default function KampusLogo({ src, alt, width, height }: KampusLogoProps) {

    return (
        <Image 
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="flex items-center justify-center w-70"
        loading="lazy"
        />
    )

}