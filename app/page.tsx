import { Suspense } from "react";
import Hero from "./section/Hero";
import About from "./section/About";
import Universities from "./section/Universities";
import Pemateri from "./section/Pemateri";
import Jobfair from "./section/Jobfair";
import Timeline from "./section/Timeline";
import FAQ from "./section/FAQ";
import Footer from "./Footer";

export default function Home() {
  return (
    <>
      <main className="bg-black">
        <Hero />
        <About />
        <Suspense fallback={<UniversitiesLoading />}>
          <Universities />
        </Suspense>
        <Suspense fallback={<PemateriLoading />}>
          <Pemateri />
        </Suspense>
        <Suspense fallback={<LembagaLoading />}>
          <Jobfair />
        </Suspense>
        <div id="timeline">
          <Timeline />
        </div>
        <div id="faq">
          <FAQ />
        </div>
      </main>
      <Footer />
    </>
  );
}

function UniversitiesLoading() {
  return (
    <section className="flex min-h-32 items-center justify-center bg-black">
      <p className="text-[#EEC57A]">Memuat daftar perguruan tinggi...</p>
    </section>
  );
}
function PemateriLoading() {
  return (
    <section className="flex min-h-32 items-center justify-center bg-black">
      <p className="text-[#EEC57A]">Memuat daftar pemateri...</p>
    </section>
  );
}
function LembagaLoading() {
  return (
    <section className="flex min-h-32 items-center justify-center bg-black">
      <p className="text-[#EEC57A]">Memuat daftar lembaga...</p>
    </section>
  );
}