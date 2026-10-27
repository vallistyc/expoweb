"use client";

import { motion, useAnimationFrame, useMotionValue } from "motion/react";
import { useRef } from "react";
import KampusLogo from "../component/KampusLogo";

type Kampus = {
  id: string;
  nama_kampus: string;
  logo: string;
  jenis: string;
};

type UniversitiesMarqueeProps = {
  kampus: Kampus[];
};

export default function UniversitiesMarquee({
  kampus,
}: UniversitiesMarqueeProps) {
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

  if (kampus.length === 0) {
    return null;
  }

  const logos = (copy: "original" | "duplicate") =>
    kampus.map((item) => (
      <div
        key={`${copy}-${item.id}`}
        className="my-5 flex shrink-0 items-center justify-center px-4"
      >
        <KampusLogo
          src={item.logo}
          alt={`${item.nama_kampus} ${item.jenis}`}
          width={100}
          height={100}
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
