"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

export type CarouselItem = {
  id: number | string;
  src: string;
  alt: string;
};

type PemateriCarouselProps = {
  items: CarouselItem[];
  /** Pemateri yang tampil di tengah saat pertama kali dibuka (mulai dari 0) */
  initialIndex?: number;
  /** "light" = untuk latar terang, "dark" = untuk latar gelap */
  tone?: "light" | "dark";
  /** Tampilkan tombol panah kiri dan kanan */
  showArrows?: boolean;
  /** Tampilkan titik indikator */
  showDots?: boolean;
  className?: string;
};

// ───── Pengaturan tampilan (ubah angka di sini) ─────
const MAX_CARD_WIDTH = 420; // lebar maksimal card tengah (px). Naikkan untuk carousel lebih besar
const CARD_RATIO = 7 / 5; // tinggi = lebar × 7/5 (card berproporsi 5:7)
const STAGE_PADDING = 8; // sisa ruang di tepi kiri/kanan panggung (px)
const SHADOW_SPACE = 32; // ruang di bawah card agar bayangan tidak terpotong (px)
const SIDE_OFFSET = 55; // jarak card samping dari tengah, dalam % lebar card
const SIDE_SCALE = 0.81; // ukuran card samping (1 = sama dengan card tengah)
const HIDDEN_SCALE = 0.6; // ukuran card yang disembunyikan
const SWIPE_THRESHOLD = 40; // minimal geseran jari/mouse (px)
const MIN_SLOTS = 5; // jumlah minimal card yang dirender agar putaran mulus

// Sejauh mana card samping menjorok dari titik tengah, dalam satuan "lebar card"
const SIDE_REACH = SIDE_OFFSET / 100 + SIDE_SCALE / 2;

// useLayoutEffect di browser (tanpa kedipan), useEffect di server
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Modulo yang aman untuk angka negatif: mod(-1, 5) = 4
function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

// Jarak sebuah slot dari slot aktif, dibungkus melingkar: ..., -2, -1, 0, 1, 2, ...
function getOffset(slot: number, active: number, slots: number) {
  const half = Math.floor(slots / 2);
  return mod(slot - active + half, slots) - half;
}

export default function PemateriCarousel({
  items,
  initialIndex = 0,
  tone = "dark",
  showArrows = true,
  showDots = true,
  className = "",
}: PemateriCarouselProps) {
  const total = items.length;

  const ui =
    tone === "light"
      ? {
          button:
            "border-black/20 text-black hover:border-black/60 hover:bg-black/5",
          dotActive: "w-6 bg-black",
          dotIdle: "w-2 bg-black/20 hover:bg-black/50",
          empty: "text-neutral-600",
        }
      : {
          button:
            "border-neutral-700 text-white hover:border-white/60 hover:bg-white/10",
          dotActive: "w-6 bg-white",
          dotIdle: "w-2 bg-white/30 hover:bg-white/60",
          empty: "text-neutral-400",
        };

  // `active` boleh terus bertambah/berkurang tanpa batas (infinite).
  // Posisi sebenarnya dihitung dengan modulo.
  const [active, setActive] = useState(() =>
    total > 0 ? mod(initialIndex, total) : 0
  );

  const startX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  // Lebar card dihitung dari lebar panggung, supaya card samping selalu muat
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(MAX_CARD_WIDTH);

  useIsoLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const fit = () => {
      const available = el.clientWidth - STAGE_PADDING * 2;
      const fitted = available / (SIDE_REACH * 2);
      setCardWidth(Math.max(120, Math.min(MAX_CARD_WIDTH, fitted)));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [total]);

  if (total === 0) {
    return <p className={`text-center ${ui.empty}`}>Belum ada pemateri.</p>;
  }

  // Hanya satu pemateri: tampilkan statis, tanpa kontrol
  if (total === 1) {
    return (
      <div
        className={`relative mx-auto aspect-[5/7] ${className}`}
        style={{ width: `min(80vw, ${MAX_CARD_WIDTH}px)` }}
      >
        <Image
          src={items[0].src}
          alt={items[0].alt}
          fill
          sizes={`(max-width: 640px) 80vw, ${MAX_CARD_WIDTH}px`}
          className="object-contain"
        />
      </div>
    );
  }

  const cardHeight = cardWidth * CARD_RATIO;

  // Gandakan daftar (hanya untuk tampilan) sampai minimal MIN_SLOTS card
  const copies = total >= MIN_SLOTS ? 1 : Math.ceil(MIN_SLOTS / total);
  const slots = total * copies;
  const slotItems = Array.from({ length: slots }, (_, slot) => ({
    slot,
    item: items[slot % total],
  }));

  const activeReal = mod(active, total); // indeks pemateri yang sedang di tengah

  function next() {
    setActive((a) => a + 1);
  }

  function prev() {
    setActive((a) => a - 1);
  }

  // Lompat ke pemateri tertentu lewat jalur terpendek (kiri atau kanan)
  function goToReal(target: number) {
    const half = Math.floor(total / 2);
    const diff = mod(target - activeReal + half, total) - half;
    setActive((a) => a + diff);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    didSwipe.current = false;
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    startX.current = null;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      didSwipe.current = true;
      if (dx < 0) next();
      else prev();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Daftar pemateri"
      className={`mx-auto w-full ${className}`}
    >
      {/* Panggung: card-card ditumpuk di sini */}
      <div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          startX.current = null;
        }}
        style={{ height: cardHeight + SHADOW_SPACE }}
        className="relative w-full touch-pan-y select-none overflow-hidden outline-none"
      >
        {slotItems.map(({ item, slot }) => {
          const offset = getOffset(slot, active, slots);
          const isActive = offset === 0;
          const isSide = Math.abs(offset) === 1;

          // Posisi dibatasi ±2 supaya card yang jauh tidak terbang keluar layar
          const clamped = Math.max(-2, Math.min(2, offset));
          const scale = isActive ? 1 : isSide ? SIDE_SCALE : HIDDEN_SCALE;
          const translateX = -50 + clamped * SIDE_OFFSET;

          return (
            <div
              key={`${item.id}-${slot}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(slot % total) + 1} dari ${total}`}
              aria-hidden={!isActive && !isSide}
              onClick={() => {
                if (didSwipe.current) {
                  didSwipe.current = false;
                  return;
                }
                if (isSide) {
                  if (offset > 0) next();
                  else prev();
                }
              }}
              style={{
                width: cardWidth,
                height: cardHeight,
                transform: `translateX(${translateX}%) scale(${scale})`,
                zIndex: isActive ? 30 : isSide ? 20 : 10,
              }}
              className={[
                "absolute left-1/2 top-0",
                // Hanya transform, opacity, dan filter yang dianimasikan.
                // Perubahan ukuran saat layar di-resize terjadi langsung.
                "transition-[transform,opacity,filter] duration-500 ease-out motion-reduce:transition-none",
                isActive
                  ? "opacity-100"
                  : isSide
                    ? "cursor-pointer grayscale"
                    : "pointer-events-none opacity-0 grayscale",
              ].join(" ")}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                draggable={false}
                sizes={`${Math.ceil(cardWidth)}px`}
                className={[
                  "object-contain",
                  isActive ? "drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" : "",
                ].join(" ")}
              />
            </div>
          );
        })}
      </div>

      {/* Kontrol: hanya dirender kalau minimal salah satunya aktif */}
      {(showArrows || showDots) && (
        <div className="mt-4 flex items-center justify-center gap-4">
          {showArrows && (
            <button
              type="button"
              onClick={prev}
              aria-label="Pemateri sebelumnya"
              className={`rounded-full border px-4 py-2 transition ${ui.button}`}
            >
              ←
            </button>
          )}

          {showDots && (
            <div className="flex items-center gap-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToReal(i)}
                  aria-label={`Ke pemateri ${i + 1}`}
                  aria-current={i === activeReal}
                  className={[
                    "h-2 rounded-full transition-all duration-300",
                    i === activeReal ? ui.dotActive : ui.dotIdle,
                  ].join(" ")}
                />
              ))}
            </div>
          )}

          {showArrows && (
            <button
              type="button"
              onClick={next}
              aria-label="Pemateri berikutnya"
              className={`rounded-full border px-4 py-2 transition ${ui.button}`}
            >
              →
            </button>
          )}
        </div>
      )}
    </section>
  );
}