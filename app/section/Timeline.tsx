import { UserRound } from "lucide-react";

const timelineItems = [
  {
    date: "Sabtu, 16 Januari 2027",
    events: [
      {
        title: "Try Out",
        audience: "Siswa kelas 12",
      },
    ],
  },
  {
    date: "Rabu, 20 Januari 2027",
    events: [
      {
        title: "Mini Job Fair",
        audience: "Siswa kelas 12",
      },
      {
        title: "Seminar Bisnis",
        audience: "Siswa kelas 10, 11, dan 12",
      },
      {
        title: "Pengumuman Giveaway 1",
        audience: "Seluruh peserta",
      },
    ],
  },
  {
    date: "Kamis, 21 Januari 2027",
    events: [
      {
        title: "Kelas Motivasi",
        audience: "Siswa kelas 12",
      },
      {
        title: "Kelas Konsentrasi",
        audience: "Siswa kelas 12",
      },
      {
        title: "Stand Kampus",
        audience: "Siswa kelas 10, 11, dan 12",
      },
      {
        title: "Performance",
        audience: "Seluruh peserta",
      },
      {
        title: "Pengumuman Giveaway Utama",
        audience: "Seluruh peserta",
      },
    ],
  },
];

export default function Timeline() {
  return (
    <section className="relative overflow-hidden bg-black px-5 py-20 text-[#EEC57A] md:px-10 lg:px-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black via-black to-transparent" />
      <div className="relative mx-auto max-w-5xl">
        <p className="text-center font-mileast text-lg uppercase tracking-[0.3em] text-[#EEC57A]/70">
          Rangkaian acara
        </p>
        <h2 className="mt-2 text-center font-arexa text-7xl leading-none text-[#EEC57A] md:text-8xl">
          Timeline
        </h2>

        <div className="relative mt-14">
          <div className="absolute bottom-0 left-4 top-0 w-px bg-linear-to-b from-transparent via-[#EEC57A] to-transparent md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-8 md:space-y-0">
            {timelineItems.map((item, index) => (
              <article
                key={item.date}
                className={`relative flex pl-12 md:w-1/2 md:py-6 md:pl-0 ${
                  index % 2 === 0
                    ? "md:justify-self-start md:pr-16"
                    : "md:ml-auto md:justify-self-end md:pl-16"
                }`}
              >
                <span className="absolute left-4 top-8 z-10 size-2.5 -translate-x-1/2 rounded-full bg-[#EEC57A] shadow-[0_0_0_5px_#000,0_0_18px_#EEC57A] md:left-auto md:right-0 md:top-1/2 md:translate-x-1/2 md:-translate-y-1/2" />
                {index % 2 !== 0 && (
                  <span className="absolute left-4 top-8 z-10 size-2.5 -translate-x-1/2 rounded-full bg-[#EEC57A] shadow-[0_0_0_5px_#000,0_0_18px_#EEC57A] md:left-0 md:top-1/2 md:translate-x-[-50%] md:-translate-y-1/2" />
                )}
                <div className="w-full border border-[#EEC57A]/30 bg-[#160602] px-5 py-5 transition-colors hover:border-[#EEC57A]">
                  <h3 className="font-kastemo text-2xl text-[#EEC57A]">
                    {item.date}
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {item.events.map((event) => (
                      <li
                        key={event.title}
                        className="border-t border-[#EEC57A]/20 pt-3 first:border-t-0 first:pt-0"
                      >
                        <p className="font-mileast text-2xl text-white md:text-3xl">
                          {event.title}
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-montserrat text-base text-[#EEC57A]/80 md:text-lg">
                          <UserRound
                            aria-hidden="true"
                            className="size-5 shrink-0 md:size-6"
                            strokeWidth={2}
                          />
                          {event.audience}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
