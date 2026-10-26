export type Pillarid = "bisnis" | "kuliah" | "kerja";

export type Program = {
    id: string;
    title: string;
    desc: string;
};

export type Pillar = {
    id: Pillarid;
    flagSrc: string;
    flagAlt: string;
    programs: Program[];
    desc: string;
};

export const pillar: Record<Pillarid, Pillar> = {
    bisnis: {
        id: 'bisnis',
        flagSrc: '/flag-bisnis.png',
        flagAlt: 'Flag Pilar Bisnis',
        desc: '"PILAR BISNIS menyuguhkan kegiatan edukasi dengan maksud mempersiapkan siswa untuk menghadapi karir bisnis atau kewirausahaan"',
        programs: [
            // PROGRAM 1
            {
                id: 'seminar-bisnis',
                title: 'SEMINAR BISNIS',
                desc: 'Seminar Bisnis berfokus untuk memupuk semangat berbisnis bagi Siswa Kelas 10, 11, dan 12. Menghadirkan pemateri yang merupakan pebisnis asli.',
            },
        ],
    },

    kuliah: {
        id: 'kuliah',
        flagSrc: '/flag-kuliah.png',
        flagAlt: 'Flag Pilar Kuliah',
        desc: '""PILAR KULIAH menyuguhkan kegiatan-kegiatan edukasi dengan maksud mempersiapkan siswa untuk menghadapi karir perkuliahan""',
        programs: [
            // PROGRAM 1
            {
                id: 'kelas-motivasi',
                title: 'KELAS MOTIVASI',
                desc: 'Kelas Motivasi menghadirkan pemateri berkompeten yang akan memotivasi Siswa Kelas 12 agar tumbuh optimisme dari dalam diri siswa untuk tidak takut kuliah di PTN Top.',
            },
            // PROGRAM 2
            {
                id: 'kelas-konsentrasi',
                title: 'KELAS KONSENTRASI',
                desc: 'Siswa dibagi berdasarkan rumpun ilmu yang diminati dan mendapat gambaran tentang bidang perkuliahan tersebut.',
            },
            // PROGRAM 3
            {
                id: 'stand-kampus',
                title: 'STAND KAMPUS',
                desc: 'Berbagai PTN, PTKIN, dan PTS hadir untuk memberikan informasi pendaftaran serta membantu siswa memantapkan pilihan kampus.',
            },
            // PROGRAM 4
            {
                id: 'tryout-snbt',
                title: 'TRY OUT SNBT',
                desc: 'Try Out SNBT menguji kemampuan siswa dalam kondisi mirip ujian asli. Dua peserta dengan nilai tertinggi mendapat beasiswa SNBT.',
            },
        ],
    },

    kerja: {
        id: 'kerja',
        flagSrc: '/flag-kerja.png',
        flagAlt: 'Flag Pilar Kerja',
        desc: '"PILAR KERJA menyuguhkan kegiatan edukasi dengan maksud mempersiapkan siswa untuk menghadapi karir pekerjaan"',
        programs: [
            // PROGRAM 1
            {
                id: 'mini-job-fair',
                title: 'MINI JOB FAIR',
                desc: 'Mini Job Fair membantu Siswa Kelas 12 mempersiapkan karir melalui pertemuan dengan 10 lembaga dan alumni dari perusahaan strategis untuk mengenal realita dunia kerja.',
            },
        ],
    },
}

export const pillarList = Object.values(pillar);