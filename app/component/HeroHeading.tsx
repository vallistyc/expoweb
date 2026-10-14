"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroHeading() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [headingWidth, setHeadingWidth] = useState<number>();

  useEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const updateWidth = () => {
      setHeadingWidth(heading.getBoundingClientRect().width);
    };

    const observer = new ResizeObserver(updateWidth);
    observer.observe(heading);
    updateWidth();

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col items-start">
      <h1
        ref={headingRef}
        className="w-max whitespace-nowrap text-[25vh] text-shadow-lg font-arexa tracking-wider leading-none font-black text-left align-middle"
      >
        EXCAMP
      </h1>
      <h2
        className="font-poppins font-thin text-[1vw] text-left text-balance tracking-widest"
        style={{ width: headingWidth }}
      >
        Era Baru dimulai di <span className="font-bold">2027</span>. Didesain
        dengan konsep yang berbeda. Menggabungkan{" "}
        <span>kuliah, kerja, dan kewirausahaan</span> menjadi satu kegiatan.
      </h2>
    </div>
  );
}
