import Image from "next/image";
import DoorIntro from "./experimental/door-intro";
import MenuCard from "./component/MenuCard";
import Login from "./component/Login";
import HeroHeading from "./component/HeroHeading";
// import './hero.css'

const Stakes = [
  "SMAN 1 Paciran"
]

export default function Home() {
  return (
    <>
      <DoorIntro />
      <main />
      <section className="Hero relative isolate w-full flex flex-col justify-end items-center h-screen">
        <div className="relative z-10 flex flex-row items-center h-screen w-full px-25">
          <div className="flex flex-col justify-start items-start gap-5 pt-10">
            <HeroHeading />
            <Login />
          </div>
        </div>

        <Image 
        src="/hero-img.gif"
        alt="Hero Image"
        width={800}
        height={600}
        className="absolute inset-0 z-0 w-full h-full object-cover brightness-75"
        />
      </section>

      <section className="Menu flex flex-col justify-center items-center py-10">
        <h2 className="font-montserrat font-black text-4xl text-[#290000]">
          Kabar Terbaru
        </h2>
      </section>

      <section className="About ">

      </section>
      <section className="Hero ">

      </section>
      <section className="Hero ">

      </section>
    </>
  );
}
