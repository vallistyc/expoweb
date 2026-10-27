const questions = [
  {
    question: "Siapa saja yang dapat mengikuti acara ini?",
    answer:
      "Acara ini terbuka untuk siswa, guru, orang tua, dan siapa pun yang ingin mengenal pilihan studi serta peluang karier lebih dekat.",
  },
  {
    question: "Apakah peserta perlu melakukan registrasi?",
    answer:
      "Ya. Silakan ikuti informasi registrasi yang akan dibagikan oleh panitia agar pengalaman kunjunganmu lebih nyaman.",
  },
  {
    question: "Apa yang perlu dibawa saat acara?",
    answer:
      "Bawa identitas diri, bukti registrasi jika tersedia, alat tulis, dan pertanyaan yang ingin kamu diskusikan dengan kampus atau perusahaan.",
  },
  {
    question: "Apakah acara ini berbayar?",
    answer:
      "Detail biaya dan ketentuan peserta akan diumumkan melalui kanal resmi EXCAMP 27.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-[#f4ecdc] px-5 py-20 text-[#281311] md:px-10 lg:px-20">
      <div className="mx-auto max-w-4xl">
        <p className="text-center font-mileast text-lg uppercase tracking-[0.3em] text-[#9b5c31]">
          Punya pertanyaan?
        </p>
        <h2 className="mt-2 text-center font-arexa text-7xl leading-none text-[#281311] md:text-8xl">
          FAQ
        </h2>
        <div className="mt-12 divide-y divide-[#9b5c31]/30 border-y border-[#9b5c31]/30">
          {questions.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-mileast text-xl text-[#281311] marker:hidden">
                {item.question}
                <span className="text-2xl transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-3xl pt-3 font-montserrat text-sm leading-relaxed text-[#655b51]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
