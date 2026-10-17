import type { Metadata } from "next";
import { Poppins, Alex_Brush, Fraunces, Montserrat } from "next/font/google";
import localfont from "next/font/local";
import "./globals.css";
import Navbar from "./component/navbar";

const arexa = localfont({
  src: "../public/fonts/ArexaDemo-Regular.otf",
  variable: "--font-arexa",
});

const kastemo = localfont({
  src: "../public/fonts/Kastemo.otf",
  variable: "--font-kastemo",
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
      className={`${poppins.variable} ${kastemo.variable} ${alex_brush.variable} ${montserrat.variable} ${fraunces.variable} ${arexa.variable} h-full antialiased`}
    >
      <body className="">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
