"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useRef } from "react";
import LogoLembaga from "../component/LogoLembaga";

type Lembaga = {
  id_lembaga: string;
  nama_lembaga: string;
  jenis: string;
  logo: string;
  uraian: string;
};

type LembagaMarqueeProps = {
  lembaga: Lembaga[];
};

export default function LembagaMarquee({
  lembaga,
}: LembagaMarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const x = useMotionValue(-0);

  useAnimationFrame((_, delta) => {
    if (isInteracting.current) {
      return;
    }

    const loopWidth = (trackRef.current?.scrollWidth ?? 0) / 2;
    if (loopWidth === 0) {
      return;
    }

    let nextX = x.get() + (delta / 1000) * 60;
    if (nextX >= 0) {
      nextX -= loopWidth;
    }
    x.set(nextX);
  });

  if (lembaga.length === 0) {
    return null;
  }

  const logos = (copy: "original" | "duplicate") =>
    lembaga.map((item) => (
      <div
        key={`${copy}-${item.id_lembaga}`}
        className="my-5 flex shrink-0 items-center justify-center px-4"
      >
        <LogoLembaga
          src={item.logo}
          alt={`${item.nama_lembaga} ${item.jenis}`}
        />
      </div>
    ));

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-label="Daftar perguruan tinggi"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-black via-black/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-black via-black/80 to-transparent"
        aria-hidden="true"
      />
      <motion.div
        ref={trackRef}
        className="flex w-max"
        style={{ x }}
        drag="x"
        dragMomentum={false}
        onDragStart={() => {
          isInteracting.current = true;
        }}
        onDragEnd={() => {
          const loopWidth = (trackRef.current?.scrollWidth ?? 0) / 2;
          if (loopWidth > 0) {
            let nextX = x.get() % loopWidth;
            if (nextX > 0) {
              nextX -= loopWidth;
            }
            x.set(nextX);
          }
          isInteracting.current = false;
        }}
        onWheel={(event) => {
          event.preventDefault();
          isInteracting.current = true;
          x.set(x.get() - event.deltaY - event.deltaX);
          window.setTimeout(() => {
            isInteracting.current = false;
          }, 1200);
        }}
      >
        <div className="flex" aria-hidden="true">
          {logos("original")}
        </div>
        <div className="flex" aria-hidden="true">
          {logos("duplicate")}
        </div>
      </motion.div>
    </div>
  );
}
