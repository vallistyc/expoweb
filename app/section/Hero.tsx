"use client";

import type { CSSProperties } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import "../hero.css";

/**
 * Satu layer hero.
 * - Tanpa `src`  : tampil sebagai placeholder CSS (bentuk warna datar).
 * - Dengan `src` : tampil sebagai gambar. `srcMobile` opsional untuk layar <= 767px.
 * - `shift` / `shiftX` : jarak gerak saat scroll (vertikal / horizontal).
 *   Layer tanpa keduanya tidak ikut bergerak.
 *
 * Cari kata "SETEL" di file ini dan di hero.css untuk menemukan semua bagian yang perlu disesuaikan.
 */
type LayerProps = {
  className: string;
  src?: string;
  srcMobile?: string;
  shift?: string;
  shiftX?: string;
  eager?: boolean;
};

function Layer({ className, src, srcMobile, shift, shiftX, eager }: LayerProps) {
  const style = { "--shift": shift, "--shift-x": shiftX } as CSSProperties;
  const cls = shift || shiftX ? `${className} parallax` : className;

  if (!src) {
    return <div className={`${cls} is-ph`} style={style} aria-hidden="true" />;
  }

  return (
    <picture style={{ display: "contents" }}>
      {srcMobile && <source media="(max-width: 767px)" srcSet={srcMobile} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className={cls}
        style={style}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        draggable={false}
      />
    </picture>
  );
}

export default function Hero() {
  const { RiveComponent } = useRive({
    src: "/char.riv", // SETEL: nama file di folder public
    animations: "Timeline 2", // SETEL: harus sama persis dengan nama animasi di editor Rive
    autoplay: true,
    // BottomCenter: kaki karakter menempel di tepi bawah kanvas, jadi pas di permukaan batu
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
  });

  return (
    <div className="hero-scroll">
      <section
        className="hero"
        aria-label="Hero"
        onPointerMove={(event) => {
          if (event.pointerType === "touch") return;

          const bounds = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
          const element = event.currentTarget;

          element.style.setProperty("--pointer-x", `${x * 18}px`);
          element.style.setProperty("--pointer-y", `${y * 12}px`);
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty("--pointer-x", "0px");
          event.currentTarget.style.setProperty("--pointer-y", "0px");
        }}
      >
        {/* 1. Langit: gambar dibuat lebih besar dari layar agar tepi aman saat bergeser */}
        {/* SETEL: tambah src="/sky.webp" (dan srcMobile) jika sudah ada gambar langit */}
        {/* <Layer className="sky" shift="-3svh" eager /> */}

        {/* 2. Panggung landscape: urut dari belakang (4) ke depan (1) */}
        {/* SETEL: shift makin ke depan makin besar. Tambah srcMobile agar HP memuat gambar lebih kecil */}
        <div className="stage">
          <Layer className="land land--4" shift="-4svh" src="/landscape4.png" />
          <Layer className="land land--3" shift="-9svh" src="/landscape3.png" />
          <Layer className="land land--2" shift="-16svh" src="/landscape2.png" />
          <Layer className="land land--1" shift="-26svh" src="/landscape1.png" />
        </div>

        {/* 3. Batu + karakter Rive: satu layer, diam (tanpa shift), z-index 30 */}
        {/* SETEL: posisi batu di .rock, posisi kaki karakter di .rock__char (hero.css) */}
        <div className="rock">
          <Layer className="rock__img" eager src="/rock.webp" />
          <div className="rock__char">
            <RiveComponent style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        {/* 4. Dinding kiri dan kanan: bergeser keluar saat scroll */}
        {/* SETEL: shiftX makin besar, dinding makin terbuka saat scroll */}
        <Layer className="wall wall--l" shiftX="-12vw" src="/cave-left.webp" />
        <Layer className="wall wall--r" shiftX="12vw" src="/cave-right.webp" />

        {/* 5. Konten tengah: posisi > bob > container (teks) */}
        {/* SETEL: href harus cocok dengan id section tujuan */}
        <div className="title">
          <div className="title__bob">
            <div className="title__box">
              <h1 className="title__h1 leading-loose">EXCAMP</h1>
              <p className="title__sub">THE NEW BEGINNING</p>
              <a className="title__cta bg-[#1E1608] text-[#F0C77C]  hover:bg-[#F0C77C] hover:text-[#1E1608] transition-ease-in-out duration-300" href="#about">
                LOG IN
              </a>
            </div>
          </div>
        </div>

        {/* 6. Foreground + blok hitam: naik menutup hero, menyambung ke section berikutnya */}
        {/* SETEL: --shift harus lebih besar dari shift layer lain, dan selaras dengan tinggi .hero-scroll */}
        <div className="fore parallax" style={{ "--shift": "-100svh" } as CSSProperties}>
          <Layer className="fore__img" src="/foreground.webp" />
        </div>
      </section>
    </div>
  );
}