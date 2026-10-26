"use client";

import Image from "next/image";
import { useState } from "react";
import Flag from "../component/Flag";
import ProgramBox from "../component/ProgramBox";
import { pillarList, type Pillarid } from "../data/pilar";
import "../component/pilar-section.css";

export default function About() {
    const [activeFlag, setActiveFlag] = useState<Pillarid>("kuliah");
    const selectedPillar = pillarList.find((pillar) => pillar.id === activeFlag) ?? pillarList[0];


    return (
        <section className="bg-[#110400] h-fit flex flex-col justify-start items-center py-15">

            <h1 className="text-[#EFC67B] text-center text-2xl font-kastemo">
                Apa yang Baru di <br />
                <span className="font-arexa text-6xl">EXPO CAMPUS?</span>
            </h1>

            <h2 className="text-[#EFC67B] text-center text-2xl font-fraunces">
                &quot;Prinsip 3 Pilar&quot;
            </h2>

            <div className="pilar-section__flag-stage">
                {/* FLAGS */}
                <div className="pilar-section__flags">
                {pillarList.map((pillar) => (
                    <Flag
                    key={pillar.id}
                    src={pillar.flagSrc}
                    alt={pillar.flagAlt}
                    width={300}
                    height={500}
                    isActive={activeFlag === pillar.id}
                    onClick={() => setActiveFlag(pillar.id)}
                    />
                ))}
                </div>

                <Image
                src="/about-top.png"
                alt="Top Cave"
                width={800}
                height={400}
                className="pilar-section__flag-overlay"
                />
            </div>

            {/* PILAR SELECTION DESCRIPTION */}
            <div className="pilar-section__description">
                <p>
                    <strong>
                        {selectedPillar.desc}
                    </strong>{" "}
                </p>
            </div>

            {/* PROGRAMS */}
            <div className={`program-grid program-grid--${activeFlag}`}
            key={activeFlag}>
                {selectedPillar.programs.map((program) => (
                    <ProgramBox
                    key={program.id}
                    title={program.title}
                    description={program.desc}
                    />
                ))}
            </div>

        </section>
    )
}