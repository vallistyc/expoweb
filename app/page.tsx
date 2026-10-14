"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

export default function Home() {
  const { RiveComponent } = useRive({
    src: "/char.riv",
    animations: "Timeline 2",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  return (
    <main className="flex flex-col justify-center h-screen w-full gap-0 bg-cyan-800">
      <section> 
        <div className="Layer 1">
          <h1 className="absolute font-arexa text-center text-7xl top-1">
            EXCAMP
          </h1>
          <RiveComponent style={{ position:"absolute", bottom: 0, width: "100%", height: 500 }} />
        </div>
      </section>
    </main>
  );
}