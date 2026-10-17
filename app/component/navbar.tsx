"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
};

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "#tentang", label: "Pusat Informasi" },
  {
    href: "#program",
    label: "Program",
    children: [
      { href: "#program", label: "Semua Program" },
      { href: "#program-kelaskonsentrasi", label: "Kelas Konsentrasi" },
      { href: "#program-tryoutsnbt", label: "Try Out SNBT" },
      { href: "#program-kelasmotivasi", label: "Kelas Motivasi" },
      { href: "#program-minijobfair", label: "Mini Job Fair" },
      { href: "#program-seminarbisnis", label: "Seminar Bisnis" },
    ],
  },
  { href: "#kontak", label: "Kontak" },
] satisfies NavItem[];

const menuPanelClass =
  "rounded-xl border border-white/15 bg-[linear-gradient(90deg,rgba(27,0,0,0.94)_6.25%,rgba(92,0,0,0.94)_50.48%,rgba(27,0,0,0.94)_100%)] p-2 shadow-xl backdrop-blur-xl";

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/konsentrasi/daftar") return null;
  const isExperimentalPage = pathname === "/experimental" || pathname === "/experimental/";
  return <Navigation key={pathname} isExperimentalPage={isExperimentalPage} />;
}

function Navigation({ isExperimentalPage }: { isExperimentalPage: boolean }) {
  const [isVisible, setIsVisible] = useState(!isExperimentalPage);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProgramMenuOpen, setIsProgramMenuOpen] = useState(false);

  useEffect(() => {
    if (!isExperimentalPage) return;

    const secondScene = document.getElementById("content");
    if (!secondScene) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );

    observer.observe(secondScene);
    return () => observer.disconnect();
  }, [isExperimentalPage]);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProgramMenuOpen(false);
  };

  return (
    <header
      aria-hidden={!isVisible}
      className={`fixed left-1/2 top-5 z-50 w-[calc(100%-32px)] max-w-full -translate-x-1/2 transition-[opacity,transform,visibility] duration-700 ease-out motion-reduce:transition-none md:max-w-7xl ${
        isVisible
          ? "visible translate-y-0 opacity-100"
          : "invisible -translate-y-6 opacity-0 pointer-events-none"
      }`}
    >
      <nav
        aria-label="Navigasi utama"
        className="relative w-full flex h-[46px] items-center justify-between border border-[#8f6868] bg-[linear-gradient(90deg,rgba(27,0,0,0.38)_6.25%,rgba(92,0,0,0.38)_50.48%,rgba(27,0,0,0.38)_100%)] px-8 backdrop-blur-[4px] md:h-[72px] md:px-8"
      >
        <Link
          href="/"
          onClick={closeMenus}
          className="inline-flex items-start text-[24px] font-normal leading-none tracking-[-0.06em] text-white md:text-[27px]"
          aria-label="Excamp 27 - Beranda"
        >
          <span className="font-serif">EXCAMP</span>
          <span className="ml-0.5 mt-0.5 font-serif text-[12px] leading-none tracking-normal text-red-500 md:text-sm">
            27
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            item.children ? (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={isProgramMenuOpen}
                  aria-controls="desktop-program-menu"
                  onClick={() => setIsProgramMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-white/90 transition hover:text-white"
                >
                  {item.label}
                  <svg
                    aria-hidden="true"
                    className={`size-4 transition-transform ${isProgramMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {isProgramMenuOpen && (
                  <div
                    id="desktop-program-menu"
                    className={`absolute left-0 top-full z-10 mt-4 min-w-56 ${menuPanelClass}`}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setIsProgramMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/90 transition hover:text-white"
              >
                {item.label}
              </Link>
            ),
          )}
          <Link
            href="#daftar"
            className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Log In
          </Link>
        </div>

        <Link
          href="#daftar"
          className="ml-auto mr-3 rounded-md border border-white/35 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/15 md:hidden"
        >
          Log In
        </Link>

        <button
          type="button"
          aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsMenuOpen((open) => !open);
            setIsProgramMenuOpen(false);
          }}
          className="inline-flex size-7 flex-col items-center justify-center gap-[4px] md:hidden"
        >
          <span className="h-[2px] w-[25px] rounded-full bg-white" />
          <span className="h-[2px] w-[25px] rounded-full bg-white" />
          <span className="h-[2px] w-[25px] rounded-full bg-white" />
        </button>

        {isMenuOpen && (
          <div
            id="mobile-navigation"
            className={`absolute left-0 right-0 top-[calc(100%+8px)] flex flex-col gap-1 md:hidden ${menuPanelClass}`}
          >
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    type="button"
                    aria-expanded={isProgramMenuOpen}
                    aria-controls="mobile-program-menu"
                    onClick={() => setIsProgramMenuOpen((open) => !open)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-white/90 transition hover:bg-white/10"
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      className={`size-4 transition-transform ${isProgramMenuOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {isProgramMenuOpen && (
                    <div id="mobile-program-menu" className="ml-3 flex flex-col border-l border-white/20 pl-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={closeMenus}
                          className="rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenus}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
