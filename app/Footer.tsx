export default function Footer() {
  return (
    <footer className="border-t border-[#EEC57A]/20 bg-[#160602] px-5 py-12 text-[#EEC57A] md:px-10 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-arexa text-6xl leading-none">EXCAMP 27</p>
          <p className="mt-3 max-w-sm font-montserrat text-sm leading-relaxed text-white/60">
            Ruang eksplorasi dan pengembangan diri untuk memulai langkah
            berikutnya.
          </p>
        </div>
        <nav aria-label="Navigasi footer" className="flex flex-wrap gap-x-6 gap-y-3 font-kastemo text-lg">
          <a className="transition-colors hover:text-white" href="#about">
            Tentang
          </a>
          <a className="transition-colors hover:text-white" href="#timeline">
            Timeline
          </a>
          <a className="transition-colors hover:text-white" href="#faq">
            FAQ
          </a>
        </nav>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-[#EEC57A]/15 pt-5 font-montserrat text-xs text-white/40">
        © 2027 EXCAMP. Semua hak dilindungi.
      </div>
    </footer>
  );
}
