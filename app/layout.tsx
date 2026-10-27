import type { Metadata } from "next";
import { Poppins, Alex_Brush, Fraunces, Montserrat, Geist } from "next/font/google";
import localfont from "next/font/local";
import "./globals.css";
import Navbar from "./component/navbar";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const arexa = localfont({
  src: "../public/fonts/ArexaDemo-Regular.otf",
  variable: "--font-arexa",
});

const kastemo = localfont({
  src: "../public/fonts/Kastemo.otf",
  variable: "--font-kastemo",
});

const mileast = localfont({
  src: [
    {
      path: "../public/fonts/Mileast.otf",
      style: "normal",
    },
    {
      path: "../public/fonts/Mileast Italic.otf",
      style: "italic",
    },
  ],
  variable: "--font-mileast-family",
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ["latin"],
  weight: ['200','400','500', '600', '700']
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const alex_brush = Alex_Brush({
  variable: "--font-alexb",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "EXCAMP 27 | The New Beginning",
  description: "Ruang eksplorasi dan pengembangan diri untuk memulai langkah berikutnya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", poppins.variable, kastemo.variable, mileast.variable, alex_brush.variable, montserrat.variable, fraunces.variable, arexa.variable, "font-sans", geist.variable)}
    >
      <body className="">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
