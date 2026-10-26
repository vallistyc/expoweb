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
    <article className="program-box mt-10">
      <Image
        className="program-box__background pt-3"
        src="/box.webp"
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
      />

      <h3 className="program-box__title font-arexa text-[clamp(2rem,5cqw,1.8rem)] leading-tight font-normal tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgb(0_0_0_/_95%)]">
        {title}
      </h3>
      <div className="program-box__body text-white">
        <p className="font-poppins text-[clamp(1rem,3cqw,1rem)] leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
