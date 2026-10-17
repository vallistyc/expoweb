"use client";

import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import type { CSSProperties } from "react";
import Login from "./Login";
import "../hero.css";

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
  const classNames = shift || shiftX ? `${className} parallax` : className;

  if (!src) {
    return <div className={`${classNames} is-ph`} style={style} aria-hidden="true" />;
  }

  return (
    <picture className="hero-layer-picture">
      {srcMobile && <source media="(max-width: 767px)" srcSet={srcMobile} />}
      <img
        src={src}
        alt=""
        className={classNames}
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
    src: "/char.riv",
    animations: "Timeline 2",
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.BottomCenter }),
  });

  return (
    <div className="hero-scroll">
      <section className="hero" aria-label="Hero EXCAMP">
        {/* Desktop: sesuaikan nilai shift tiap layer bila kedalaman parallax terasa kurang/berlebih. */}
        <Layer className="sky" shift="-3svh" eager />

        <div className="stage" aria-hidden="true">
          <Layer className="land land--far" src="/landscape4.png" shift="-6svh" eager />
          <Layer className="land land--mid-far" src="/landscape3.png" shift="-12svh" eager />
          <Layer className="land land--mid" src="/landscape2.png" shift="-19svh" eager />
          <Layer className="land land--near" src="/landscape1.png" shift="-26svh" eager />
        </div>

        <div className="rock" aria-hidden="true">
          <Layer className="rock__img" src="/rock.webp" eager />
          <div className="rock__character">
            <RiveComponent />
          </div>
        </div>

        <Layer className="wall wall--l" src="/cave-left.png" shiftX="-12vw" eager />
        <Layer className="wall wall--r" src="/cave-right.png" shiftX="12vw" eager />

        <div className="title">
          <div className="title__box">
            <h1 className="title__h1">
              EXCAMP
              <span>The New Beginning</span>
            </h1>
            <Login />
          </div>
        </div>

        <div
          className="fore parallax"
          style={{ "--shift": "-100svh" } as CSSProperties}
          aria-hidden="true"
        >
          <Layer className="fore__img" src="/foreground.webp" />
        </div>
      </section>
    </div>
  );
}
