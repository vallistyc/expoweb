import { div } from "motion/react-client";
import ArticleCard from "./ArticleCard";


export default function ArticlesPage() {
    return (
        <div className="bg-black flex flex-col h-screen justify-start py-25 items-center">
            <h1 className=" text-center text-7xl font-arexa text-[#EEC57A] pb-5">
                Kabar Terkini
            </h1>
            <ArticleCard 
            title="Buku Panduan Expo Campus 2027"
            slug="buku-panduan-expo-campus-2027" 
            thumbnail="/hero-img.gif"
            published="5 mei 2026"
            />

        </div>
    )
}