import {createSupabaseServerClient} from "../lib/supabase-server";
import Image from "next/image";
import LInk from "next/link";
import ProgramCard from "./ProgramCard";

type Program = {
    id: string
    nama: string
    thumbnail: string
    slug: string
    pilar: string
}

export default async function Program() {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
        return <p className='text-red-500 text-center'>Gagal menghubungkan ke database, periksa Environment Variables</p>;
    }

    const {data, error} = await supabase
    .schema('expoweb')
    .from('program')
    .select('id, nama, thumbnail, slug, pilar')
    .order('id', {ascending: true})

    if (error) {
        return <p className='text-red-500 text-center'>Gagal mengambil data dari database: {error.message}</p>;
    }

    const listProgram = (data ?? []) as Program[];

    if (listProgram.length === 0) {
        return (
            <div className='flex min-h-[70vh] items-center justify-center bg-[#080808] px-6'>
                <p className='text-center text-xl text-white/60'>Belum ada program nih.</p>
            </div>
        )
    }

    return (
        <main className='min-h-screen bg-[#080808] px-5 py-20 text-white sm:px-8 lg:px-12'>
            <header className='mx-auto mb-12 pt-15 max-w-7xl flex flex-col text-center justify-center items-center'>
                <div className='flex flex-col justify-between gap-5 md:flex-row md:items-end'>
                    <h1 className='max-w-2xl font-arexa text-8xl leading-[0.95] text-[#EEC57A] sm:text-7xl'>
                        PROGRAM
                    </h1>
                    <p className='max-w-sm text-sm leading-6 text-white/50'>
                        Temukan program-program menarik yang akan diadakan selama Expo Campus berlangsung.
                    </p>
                </div>
            </header>
            <div className='mx-auto grid gap-15 max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                {listProgram.map((program)=>(
                    <ProgramCard 
                        key={program.id}
                        src={program.thumbnail}
                        alt={program.nama}
                        slug={program.slug}
                        pilar={program.pilar}
                        nama={program.nama}
                    />
                ))}
            </div>
        </main>
    )
}