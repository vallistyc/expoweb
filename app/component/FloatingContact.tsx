import Link from "next/link";
import { Phone } from 'lucide-react';

const NomorWa = "https://wa.me/6289514482318";

export default function FloatingContact() {
    return (
        <div>
            <Link href={NomorWa} className="rounded-full p-5 bg-green-400 text-mauve-950 fixed bottom-5 right-5 z-100 hover:bg-black hover:text-white ease-in-out duration-300">
                <Phone className="w-full h-auto" />
            </Link>
        </div>
    )
}