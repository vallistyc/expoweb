import { createSupabaseServerClient } from "../lib/supabase-server";
import UniversitiesMarquee from "./LembagaMarquee";
import Link from "next/link";

type Lembaga = {
    id_lembaga: string;
    nama_lembaga: string;
    logo: string;
    jenis: string;
    uraian: string;
};

export default async function Universities() {
    // Create a Supabase client using the server-side configuration
    const supabase = createSupabaseServerClient();

    // Check if the Supabase client was created successfully
    if (!supabase) {
        return <p>Gagal menghubungkan ke database, periksa Environment Variables</p>;
    }

    // Execute the query to fetch data from the 'univ' table. the data will be stored to 'data' variable and error will be stored to 'error' variable if any error occurs during the query execution
    const { data, error } = await supabase
        .schema("expoweb")
        .from("lembaga")
        .select("id_lembaga, nama_lembaga, logo, jenis, uraian")
        // .order("nama_kampus", { ascending: true });

    // Check if there was an error during the query execution. If there was, display an error message. Otherwise, map over the data and render the list of universities with their logos, names, and types.
    if (error) {
        return <p className="text-red-500 text-center">Gagal mengambil data dari database: {error.message}</p>;
    }

    // Storing the fetched data into a array variable 'listKampus' and asserting its type to be an array of 'Kampus' objects. If 'data' is null or undefined, it will default to an empty array.
    const listKampus = (data ?? []) as Lembaga[];

    return (
        <section className=" flex flex-col items-center justify-center border-0 bg-black py-25 h-screen">
            <h4 className="font-kastemo text-5xl text-[#EEC57A]">
                JOBFAIR DI SMAPA
            </h4>
            <h3 className="flex flex-col text-center line-height-0 bg-linear-to-r from-[#5A3A00] via-[#EF9A00] to-[#5A3A00] bg-clip-text text-8xl pb-15 font-arexa leading-none text-transparent">
                PERTAMA KALINYA
            </h3>
            <UniversitiesMarquee lembaga={listKampus} />
            <Link href="/lembaga" className="bg-[#EEC57A] hover:bg-[#1E1608] hover:text-[#EEC57A] px-6 py-3 mt-15 text-3xl font-semibold font-kastemo text-black transition-colors duration-300">
                lihat lebih lanjut
            </Link>
        </section>
    );
}