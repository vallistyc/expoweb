"use client";

import { useMotionValue, motion, useMotionTemplate } from "motion/react";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  radius = 350,
  color = "rgba(255, 255, 255, 0.15)",
  dotColors = [[255, 255, 255]],
  className,
  ...props
}: {
  radius?: number;
  /** Warna cahaya spotlight. Pakai rgba supaya titik tetap terlihat. */
  color?: string;
  /** Warna titik dalam format RGB, maksimal 3 warna. Contoh: [[255, 255, 255]] */
  dotColors?: number[][];
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: ReactMouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const [isHovering, setIsHovering] = useState(false);
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div
      className={cn(
        "group/spotlight relative rounded-md border border-neutral-800 bg-black p-0 dark:border-neutral-800",
        // Glow luar: bayangan putih + border menyala saat di-hover
        "transition-[box-shadow,border-color] duration-300",
        "hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.div
        className="pointer-events-none absolute z-0 -inset-px rounded-md opacity-0 transition duration-300 group-hover/spotlight:opacity-100"
        style={{
          backgroundColor: color,
          maskImage: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
        }}
      >
        {isHovering && (
          <CanvasRevealEffect
            animationSpeed={5}
            containerClassName="bg-transparent absolute inset-0 pointer-events-none"
            colors={dotColors}
            dotSize={3}
            showGradient={false}
          />
        )}
      </motion.div>
      {children}
    </div>
  );
};