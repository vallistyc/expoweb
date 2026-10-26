"use client";

import Image from "next/image";

type FlagProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    isActive: boolean;
    onClick: () => void;
};

export default function Flag({ width, height, src, alt, isActive, onClick }: FlagProps) {
    return (
        <button
        type="button"
        className={`flag ${isActive ? "flag-active" : "flag-inactive"}`}
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={`Pilih ${alt}`}
        >
            <Image 
            src={src}
            alt={alt}
            width={width}
            height={height}
            className = "flag__image"
            />
        </button>
    )
}