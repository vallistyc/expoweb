"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties } from "react";
import styles from "./experimental.module.css";

export default function DoorIntro() {
  const [zoomScale, setZoomScale] = useState(3.6);
  const [zoomOrigin, setZoomOrigin] = useState({ x: "50%", y: "39%" });
  const [isZooming, setIsZooming] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const sceneStyle: CSSProperties & {
    "--zoom-scale": number;
    "--zoom-origin-x": string;
    "--zoom-origin-y": string;
  } = {
    "--zoom-scale": zoomScale,
    "--zoom-origin-x": zoomOrigin.x,
    "--zoom-origin-y": zoomOrigin.y,
  };

  if (isComplete) return null;

  return (
    <div className={`${styles.track} ${isFading ? styles.fadeWalls : ""}`}>
      <div ref={stageRef} className={styles.stage}>
        <div
          className={`${styles.scene} ${isZooming ? styles.zooming : ""}`}
          style={sceneStyle}
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.animationName.endsWith("scene-zoom")
            ) {
              setIsFading(true);
            }
          }}
        >
          <div className={styles.floor} aria-hidden="true" />
          <div ref={openingRef} className={styles.opening}>
            <div
              className={`${styles.room} ${isFading ? styles.fading : ""}`}
              onAnimationEnd={(event) => {
                if (
                  event.target === event.currentTarget &&
                  event.animationName.endsWith("room-fade")
                ) {
                  setIsComplete(true);
                }
              }}
            />
            <div
              className={styles.door}
              onAnimationEnd={(event) => {
                if (
                  event.target === event.currentTarget &&
                  event.animationName.endsWith("door-open")
                ) {
                  const opening = openingRef.current?.getBoundingClientRect();
                  const stage = stageRef.current?.getBoundingClientRect();

                  if (opening && stage && opening.width > 0 && opening.height > 0) {
                    const centerX = opening.left + opening.width / 2 - stage.left;
                    const centerY = opening.top + opening.height / 2 - stage.top;
                    const coverScale = Math.max(
                      centerX / (opening.width / 2),
                      (stage.width - centerX) / (opening.width / 2),
                      centerY / (opening.height / 2),
                      (stage.height - centerY) / (opening.height / 2),
                    );

                    setZoomScale(coverScale * 1.08);
                    setZoomOrigin({ x: `${centerX}px`, y: `${centerY}px` });
                  }

                  setIsZooming(true);
                }
              }}
            >
              <Image
                src="/expoweb-open-door.webp"
                alt=""
                width={787}
                height={1350}
                sizes="(max-width: 480px) 46vw, 260px"
                priority
                className={styles.doorImg}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
