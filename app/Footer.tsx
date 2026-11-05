import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#EEC57A]/20 bg-[#100302] px-5 pb-6 pt-14 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="Excamp 27 - Beranda">
              <Image
                src="/logo-excamp-horizontal.webp"
                alt="Excamp 27"
                width={240}
                height={64}
                className="h-auto w-52 object-contain"
              />
            </Link>
            <p className="mt-6 max-w-md font-montserrat text-sm leading-7 text-white/55">
              Ruang eksplorasi dan pengembangan diri untuk memulai langkah berikutnya.
              Temukan inspirasi, informasi, dan pengalaman baru bersama EXCAMP.
            </p>
          </div>

          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#EEC57A]">
              Jelajahi
            </p>
            <nav aria-label="Navigasi footer" className="flex flex-col items-start gap-3 font-montserrat text-sm text-white/65">
              <Link className="transition-colors hover:text-[#EEC57A]" href="/program">
                Semua Program
              </Link>
              <Link className="transition-colors hover:text-[#EEC57A]" href="/articles">
                Pusat Informasi
              </Link>
              <Link className="transition-colors hover:text-[#EEC57A]" href="/#timeline">
                Timeline
              </Link>
              <Link className="transition-colors hover:text-[#EEC57A]" href="/#faq">
                FAQ
              </Link>
            </nav>
          </div>

          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#EEC57A]">
              Mulai langkahmu
            </p>
            <p className="font-montserrat text-sm leading-6 text-white/55">
              Siap menemukan pengalaman baru? Lihat program yang tersedia dan pilih
              perjalananmu bersama kami.
            </p>
            <Link
              href="/program"
              className="mt-6 inline-flex items-center gap-3 border border-[#EEC57A] px-4 py-3 font-montserrat text-xs font-semibold uppercase tracking-[0.16em] text-[#EEC57A] transition-colors hover:bg-[#EEC57A] hover:text-[#100302]"
            >
              Lihat program <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 font-montserrat text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2027 EXCAMP. Semua hak dilindungi.</p>
          <p className="uppercase tracking-[0.16em]">The New Beginning</p>
        </div>
      </div>
    </footer>
  );
}
