# Panduan Implementasi UI 3 Pilar Expo Campus

Dokumen ini adalah panduan lengkap untuk membuat UI seperti desain referensi:

1. Tiga flag ditampilkan berdampingan: Bisnis, Kuliah, dan Kerja.
2. User memilih salah satu flag dengan klik.
3. Flag yang dipilih tetap berwarna.
4. Flag lain berubah menjadi hitam-putih.
5. Judul dan deskripsi pilar yang dipilih berubah.
6. Empat box program ditampilkan di bawahnya.
7. Posisi empat box dapat berbeda untuk setiap pilar.
8. Konten program ditampilkan di atas gambar box.

Panduan ini menggunakan:

- Next.js App Router.
- React dan TypeScript.
- `next/image`.
- CSS biasa.
- Data statis dari file TypeScript.

## 1. Konsep utama

UI ini sebaiknya dibuat sebagai satu komponen interaktif, bukan tiga halaman
terpisah.

```text
User klik flag
        |
        v
activePillar berubah
        |
        +--> flag aktif tetap berwarna
        +--> flag lain menjadi grayscale
        +--> judul dan deskripsi berubah
        +--> empat program berubah
        +--> layout program berubah
```

State yang diperlukan hanya satu:

```tsx
const [activePillar, setActivePillar] = useState<PillarId>("kuliah");
```

`activePillar` menyimpan id pilar yang sedang dipilih.

## 2. Struktur file

Gunakan struktur berikut:

```text
app/
├── component/
│   ├── Flag.tsx
│   ├── ProgramBox.tsx
│   └── pilar-section.css
├── data/
│   └── pilar.ts
└── section/
    └── About.tsx

public/
├── about-top.png
├── box.webp
├── flag-bisnis.png
├── flag-kuliah.png
└── flag-kerja.png
```

Asset flag pada project ini sudah tersedia di folder `public`. Path dari
folder `public` selalu ditulis mulai dari `/`, bukan `public/`.

Benar:

```tsx
src="/flag-bisnis.png"
```

Salah:

```tsx
src="public/flag-bisnis.png"
```

## 3. Menentukan tipe data pilar

Edit file `app/data/pilar.ts` dan isi dengan kode berikut:

```tsx
export type PillarId = "bisnis" | "kuliah" | "kerja";

export type Program = {
  id: string;
  title: string;
  description: string;
};

export type Pillar = {
  id: PillarId;
  flagSrc: string;
  flagAlt: string;
  title: string;
  description: string;
  programs: Program[];
};

export const pillars: Record<PillarId, Pillar> = {
  bisnis: {
    id: "bisnis",
    flagSrc: "/flag-bisnis.png",
    flagAlt: "Flag Pilar Bisnis",
    title: "PILAR BISNIS",
    description:
      "Pilar bisnis menyuguhkan kegiatan edukasi dengan maksud mempersiapkan siswa untuk menghadapi karir bisnis atau kewirausahaan.",
    programs: [
      {
        id: "seminar-bisnis",
        title: "SEMINAR BISNIS",
        description:
          "Seminar ini berfokus untuk mempersiapkan siswa agar berani memulai dan mengembangkan bisnis.",
      },
      {
        id: "business-plan",
        title: "BUSINESS PLAN",
        description:
          "Peserta belajar menyusun ide bisnis, target pasar, strategi, dan rencana pengembangan usaha.",
      },
      {
        id: "business-challenge",
        title: "BUSINESS CHALLENGE",
        description:
          "Peserta menyelesaikan tantangan bisnis secara berkelompok dengan menerapkan ide dan strategi.",
      },
      {
        id: "business-expo",
        title: "BUSINESS EXPO",
        description:
          "Peserta mempresentasikan hasil ide bisnis kepada pengunjung dan mendapatkan masukan.",
      },
    ],
  },

  kuliah: {
    id: "kuliah",
    flagSrc: "/flag-kuliah.png",
    flagAlt: "Flag Pilar Kuliah",
    title: "PILAR KULIAH",
    description:
      "Pilar kuliah menyuguhkan kegiatan edukasi untuk mempersiapkan siswa menghadapi karir perkuliahan.",
    programs: [
      {
        id: "mini-job-fair",
        title: "MINI JOB FAIR",
        description:
          "Peserta memperoleh gambaran tentang pilihan jurusan dan peluang karir setelah kuliah.",
      },
      {
        id: "campus-experience",
        title: "CAMPUS EXPERIENCE",
        description:
          "Peserta mengenal suasana kampus dan mendapatkan informasi dari mahasiswa atau alumni.",
      },
      {
        id: "study-plan",
        title: "STUDY PLAN",
        description:
          "Peserta menyusun rencana belajar dan persiapan untuk mencapai pilihan jurusan.",
      },
      {
        id: "scholarship-info",
        title: "SCHOLARSHIP INFO",
        description:
          "Peserta memperoleh informasi tentang beasiswa dan persyaratan yang perlu dipersiapkan.",
      },
    ],
  },

  kerja: {
    id: "kerja",
    flagSrc: "/flag-kerja.png",
    flagAlt: "Flag Pilar Kerja",
    title: "PILAR KERJA",
    description:
      "Pilar kerja menyuguhkan kegiatan edukasi untuk mempersiapkan siswa menghadapi dunia kerja.",
    programs: [
      {
        id: "career-talk",
        title: "CAREER TALK",
        description:
          "Peserta mendengarkan pengalaman dan wawasan dari orang yang sudah bekerja.",
      },
      {
        id: "cv-workshop",
        title: "CV WORKSHOP",
        description:
          "Peserta belajar membuat CV yang rapi, jelas, dan sesuai dengan tujuan karir.",
      },
      {
        id: "interview-practice",
        title: "INTERVIEW PRACTICE",
        description:
          "Peserta berlatih menjawab pertanyaan wawancara dan menyampaikan kelebihan diri.",
      },
      {
        id: "workplace-insight",
        title: "WORKPLACE INSIGHT",
        description:
          "Peserta memahami etika, kebiasaan, dan ekspektasi yang umum di lingkungan kerja.",
      },
    ],
  },
};

export const pillarList = Object.values(pillars);
```

### Catatan data

- Setiap pilar wajib memiliki tepat empat object di `programs`.
- `id` setiap program harus unik.
- `title` adalah teks yang muncul pada box.
- `description` adalah isi teks pada box.
- Jika desain membutuhkan icon atau gambar program, tambahkan property `image`
  pada type `Program` dan setiap datanya.

## 4. Membuat komponen `Flag`

Edit `app/component/Flag.tsx` menjadi:

```tsx
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

export default function Flag({
  src,
  alt,
  width,
  height,
  isActive,
  onClick,
}: FlagProps) {
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
        className="flag__image"
      />
    </button>
  );
}
```

### Hal penting pada komponen `Flag`

- `"use client"` harus berada di baris pertama karena komponen memiliki event
  klik dan dipakai oleh komponen yang menggunakan state.
- Gunakan `button`, bukan `div`, supaya dapat diklik dengan keyboard.
- `isActive` menentukan class aktif atau tidak aktif.
- `aria-pressed` memberi informasi status kepada screen reader.
- Gunakan `Image` dari `next/image`, bukan string `public/...`.

## 5. Membuat komponen `ProgramBox`

Program box memiliki gambar sebagai background dan teks di atas gambar.
Karena itu parent harus `position: relative`, gambar menggunakan `fill`, dan
konten menggunakan `z-index` yang lebih tinggi.

Edit `app/component/ProgramBox.tsx` menjadi:

```tsx
import Image from "next/image";

type ProgramBoxProps = {
  title: string;
  description: string;
};

export default function ProgramBox({
  title,
  description,
}: ProgramBoxProps) {
  return (
    <article className="program-box">
      <Image
        className="program-box__background"
        src="/box.webp"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />

      <div className="program-box__content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
```

### Mengapa `alt=""` pada gambar box?

Pada contoh ini, `box.webp` hanya merupakan dekorasi/background. Informasi
pentingnya sudah tersedia di `title` dan `description`. Karena itu gambar
dekorasi tidak perlu dibacakan ulang oleh screen reader.

Jika gambar berisi informasi penting, ganti `alt=""` dengan deskripsi yang
sesuai.

### Kesalahan umum pada `Image`

Jangan memakai `width` dan `height` sekaligus `fill` pada instance yang sama.
Pilih salah satu pola:

```tsx
<Image src="/box.webp" alt="" width={300} height={180} />
```

atau:

```tsx
<Image src="/box.webp" alt="" fill sizes="100vw" />
```

Pola `fill` membutuhkan parent dengan `position: relative` dan tinggi yang
jelas.

## 6. Membuat section interaktif

Edit `app/section/About.tsx` menjadi:

```tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import Flag from "../component/Flag";
import ProgramBox from "../component/ProgramBox";
import { pillarList, pillars, type PillarId } from "../data/pilar";
import "../component/pilar-section.css";

export default function About() {
  const [activePillar, setActivePillar] = useState<PillarId>("kuliah");
  const selectedPillar = pillars[activePillar];

  return (
    <section className="pilar-section" aria-labelledby="pilar-title">
      <div className="pilar-section__heading">
        <h1 id="pilar-title">
          Apa yang Baru di
          <span>EXPO CAMPUS?</span>
        </h1>
        <h2>Prinsip 3 Pilar</h2>
      </div>

      <div className="pilar-section__flags" aria-label="Pilih pilar">
        {pillarList.map((pillar) => (
          <Flag
            key={pillar.id}
            src={pillar.flagSrc}
            alt={pillar.flagAlt}
            width={300}
            height={500}
            isActive={activePillar === pillar.id}
            onClick={() => setActivePillar(pillar.id)}
          />
        ))}
      </div>

      <div className="pilar-section__description">
        <p>
          <strong>{selectedPillar.title}</strong>{" "}
          {selectedPillar.description}
        </p>
      </div>

      <div className="pilar-section__program-area">
        <Image
          className="pilar-section__background"
          src="/about-top.png"
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 900px"
        />

        <div
          className={`program-grid program-grid--${activePillar}`}
          key={activePillar}
        >
          {selectedPillar.programs.map((program) => (
            <ProgramBox
              key={program.id}
              title={program.title}
              description={program.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Posisi penting `useState`

`useState` harus berada di dalam function component:

```tsx
export default function About() {
  const [activePillar, setActivePillar] = useState<PillarId>("kuliah");
}
```

Jangan menulis seperti ini di luar component:

```tsx
const [activePillar, setActivePillar] = useState("kuliah");
```

React Hook tidak boleh dipanggil pada level module.

## 7. Menulis CSS overlay dan layout

Buat file `app/component/pilar-section.css`:

```css
.pilar-section {
  min-height: 100vh;
  overflow: hidden;
  padding: 64px 24px 96px;
  color: #fff;
  background: #160602;
}

.pilar-section__heading {
  position: relative;
  z-index: 2;
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}

.pilar-section__heading h1 {
  margin: 0;
  color: #efc67b;
  font-family: var(--font-kastemo), serif;
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 400;
  line-height: 1.2;
}

.pilar-section__heading h1 span {
  display: block;
  font-family: var(--font-arexa), serif;
  font-size: clamp(2.5rem, 7vw, 5rem);
}

.pilar-section__heading h2 {
  margin: 16px 0 0;
  color: #efc67b;
  font-family: var(--font-fraunces), serif;
  font-size: 1.25rem;
  font-weight: 400;
}

.pilar-section__flags {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  max-width: 900px;
  margin: 40px auto 0;
}

.flag {
  position: relative;
  display: block;
  width: min(31vw, 300px);
  margin: 0 -12px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition:
    filter 300ms ease,
    opacity 300ms ease,
    transform 300ms ease;
}

.flag:nth-child(1) {
  z-index: 1;
}

.flag:nth-child(2) {
  z-index: 2;
}

.flag:nth-child(3) {
  z-index: 1;
}

.flag:hover,
.flag:focus-visible {
  transform: translateY(-8px);
}

.flag:focus-visible {
  outline: 3px solid #efc67b;
  outline-offset: 4px;
}

.flag-active {
  z-index: 3;
  filter: grayscale(0);
  transform: translateY(-8px) scale(1.03);
}

.flag-inactive {
  filter: grayscale(1);
  opacity: 0.8;
}

.flag__image {
  display: block;
  width: 100%;
  height: auto;
}

.pilar-section__description {
  position: relative;
  z-index: 2;
  max-width: 640px;
  margin: 32px auto 0;
  text-align: center;
  font-family: var(--font-montserrat), sans-serif;
  font-size: 0.9rem;
  line-height: 1.6;
}

.pilar-section__description strong {
  font-weight: 700;
}

.pilar-section__program-area {
  position: relative;
  max-width: 900px;
  min-height: 560px;
  margin: 40px auto 0;
  padding: 48px 24px;
  overflow: hidden;
}

.pilar-section__background {
  z-index: 0;
  object-fit: cover;
  object-position: center;
  opacity: 0.35;
}

.program-grid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
}

.program-grid--bisnis {
  grid-template-areas:
    "program-1 program-1"
    "program-2 program-3"
    "program-4 program-4";
}

.program-grid--kuliah {
  grid-template-areas:
    "program-1 program-2"
    "program-3 program-3"
    "program-4 program-4";
}

.program-grid--kerja {
  grid-template-areas:
    "program-1 program-1"
    "program-2 program-3"
    "program-4 program-4";
}

.program-grid .program-box:nth-child(1) {
  grid-area: program-1;
}

.program-grid .program-box:nth-child(2) {
  grid-area: program-2;
}

.program-grid .program-box:nth-child(3) {
  grid-area: program-3;
}

.program-grid .program-box:nth-child(4) {
  grid-area: program-4;
}

.program-box {
  position: relative;
  min-height: 150px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 8px;
  background: #087ba8;
}

.program-box__background {
  z-index: 0;
  object-fit: cover;
}

.program-box__content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 150px;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  background: linear-gradient(
    to top,
    rgb(0 0 0 / 75%),
    rgb(0 0 0 / 10%)
  );
}

.program-box__content h3 {
  margin: 0;
  color: #fff;
  font-family: var(--font-montserrat), sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
}

.program-box__content p {
  margin: 8px 0 0;
  color: #fff;
  font-family: var(--font-montserrat), sans-serif;
  font-size: 0.7rem;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .pilar-section {
    padding-right: 12px;
    padding-left: 12px;
  }

  .pilar-section__flags {
    margin-top: 28px;
  }

  .flag {
    width: 36vw;
    margin: 0 -9px;
  }

  .pilar-section__program-area {
    min-height: 660px;
    padding: 32px 12px;
  }

  .program-grid--bisnis,
  .program-grid--kuliah,
  .program-grid--kerja {
    grid-template-areas:
      "program-1"
      "program-2"
      "program-3"
      "program-4";
  }
}

@media (prefers-reduced-motion: reduce) {
  .flag {
    transition: none;
  }
}
```

### Cara kerja overlay

```css
.pilar-section__program-area {
  position: relative;
}

.pilar-section__background {
  position: absolute;
  z-index: 0;
}

.program-grid {
  position: relative;
  z-index: 1;
}
```

Parent menjadi area acuan. Gambar berada di layer belakang, sementara grid
program berada di layer depan.

## 8. Menghubungkan section ke halaman

Pastikan `app/page.tsx` mengimpor `About`:

```tsx
import Hero from "./section/Hero";
import About from "./section/About";

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
    </main>
  );
}
```

Jika `About` sudah seperti ini, tidak perlu mengubah `page.tsx`.

## 9. Mengubah susunan empat box

Setiap `program-grid` menggunakan CSS Grid Areas. Nama area harus konsisten:

```css
.program-grid--bisnis {
  grid-template-areas:
    "program-1 program-1"
    "program-2 program-3"
    "program-4 program-4";
}
```

Urutan program ditentukan oleh posisi array:

```text
programs[0] -> program-1
programs[1] -> program-2
programs[2] -> program-3
programs[3] -> program-4
```

Contoh jika box pertama ingin berada di kiri dan tiga box lain berada di kanan:

```css
.program-grid--kerja {
  grid-template-areas:
    "program-1 program-2"
    "program-1 program-3"
    "program-1 program-4";
}
```

Jumlah kolom pada setiap baris harus konsisten. Jangan membuat pola dengan
jumlah kolom yang tidak sama karena CSS Grid dapat menghasilkan layout yang
tidak diharapkan.

## 10. Menjalankan dan menguji

Jalankan development server:

```bash
npm run dev
```

Buka alamat yang ditampilkan Next.js, biasanya:

```text
http://localhost:3000
```

Uji checklist berikut:

- [ ] Tiga flag terlihat.
- [ ] Flag Kuliah aktif saat halaman pertama dibuka.
- [ ] Flag aktif tetap berwarna.
- [ ] Flag lain menjadi grayscale.
- [ ] Klik Bisnis mengganti judul, deskripsi, dan program.
- [ ] Klik Kuliah mengganti judul, deskripsi, dan program.
- [ ] Klik Kerja mengganti judul, deskripsi, dan program.
- [ ] Tepat empat box tampil untuk setiap pilar.
- [ ] Teks berada di atas gambar box.
- [ ] Tidak ada gambar yang pecah.
- [ ] Tampilan tetap terbaca pada layar mobile.
- [ ] Tombol flag dapat dipilih menggunakan keyboard.
- [ ] Tidak ada error TypeScript atau ESLint.

Sebelum selesai, jalankan:

```bash
npm run lint
npm run build
```

## 11. Error umum dan solusinya

### Error: `Invalid hook call`

Penyebabnya biasanya `useState` diletakkan di luar function component.

Salah:

```tsx
const [activePillar, setActivePillar] = useState("kuliah");

export default function About() {
  return null;
}
```

Benar:

```tsx
export default function About() {
  const [activePillar, setActivePillar] = useState("kuliah");
  return null;
}
```

### Error: `Image with fill requires a non-static position parent`

Tambahkan:

```css
.program-box,
.pilar-section__program-area {
  position: relative;
}
```

Parent juga harus memiliki tinggi atau `min-height`.

### Error: class aktif tidak berubah

Pastikan template string menggunakan backtick:

```tsx
className={`flag ${isActive ? "flag-active" : "flag-inactive"}`}
```

Jangan menggunakan tanda kutip biasa:

```tsx
className={'flag ${isActive ? "flag-active" : "flag-inactive"}'}
```

### Error: gambar tidak muncul

Untuk gambar di `public/flag-bisnis.png`, gunakan:

```tsx
src="/flag-bisnis.png"
```

Bukan:

```tsx
src="/public/flag-bisnis.png"
```

### Error: teks berada di belakang gambar

Pastikan content memiliki `position` dan `z-index`:

```css
.program-box__content {
  position: relative;
  z-index: 1;
}
```

Gambar harus memiliki z-index lebih rendah:

```css
.program-box__background {
  z-index: 0;
}
```

### Error: layout box selalu sama

Pastikan class layout memakai nilai `activePillar`:

```tsx
className={`program-grid program-grid--${activePillar}`}
```

Dan CSS memiliki selector yang sesuai:

```css
.program-grid--bisnis { /* layout bisnis */ }
.program-grid--kuliah { /* layout kuliah */ }
.program-grid--kerja { /* layout kerja */ }
```

## 12. Pengembangan lanjutan

### Menambahkan gambar berbeda untuk setiap program

Ubah type `Program`:

```tsx
export type Program = {
  id: string;
  title: string;
  description: string;
  image: string;
};
```

Lalu ubah `ProgramBoxProps`:

```tsx
type ProgramBoxProps = {
  title: string;
  description: string;
  image: string;
};
```

`ProgramBox` dapat memakai `image` dari props:

```tsx
<Image
  className="program-box__background"
  src={image}
  alt=""
  fill
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### Menambahkan animasi saat program berganti

Class `key={activePillar}` pada `program-grid` membuat React membuat ulang grid
ketika pilar berubah. Animasi CSS dapat ditambahkan:

```css
.program-grid {
  animation: program-grid-enter 350ms ease both;
}

@keyframes program-grid-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Jangan lupa mempertahankan media query `prefers-reduced-motion` jika animasi
ditambahkan.

## 13. Ringkasan tanggung jawab setiap file

| File | Tanggung jawab |
| --- | --- |
| `app/data/pilar.ts` | Menyimpan data tiga pilar dan dua belas program |
| `app/component/Flag.tsx` | Menampilkan satu flag dan menangani klik |
| `app/component/ProgramBox.tsx` | Menampilkan satu box dengan gambar dan teks |
| `app/component/pilar-section.css` | Mengatur warna, grayscale, overlay, responsive, dan grid |
| `app/section/About.tsx` | Menyimpan state dan menggabungkan semua komponen |
| `app/page.tsx` | Memasang section ke halaman utama |
| `public/*` | Menyimpan asset gambar |

Jika terjadi perubahan pada isi program, edit `app/data/pilar.ts`. Jika terjadi
perubahan pada bentuk atau posisi visual, edit CSS. Jika terjadi perubahan
pada alur klik atau state, edit `About.tsx`.
