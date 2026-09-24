import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Augustus Loft Leipzig | Luxury Holiday Apartment in Leipzig Zentrum",
  description:
    "Direct booking for The Augustus Loft Leipzig. Designer 2-bedroom serviced holiday apartment adjacent to Augustusplatz & Gewandhaus. High-speed Wi-Fi, gourmet kitchen, rainfall shower, 24/7 self check-in.",
  keywords: [
    "Leipzig holiday apartment",
    "Leipzig short-term rental",
    "Leipzig vacation apartment",
    "Ferienwohnung Leipzig",
    "Apartment Leipzig Zentrum",
    "Leipzig accommodation",
    "Gewandhaus Leipzig accommodation",
    "Augustusplatz apartment",
  ],
  authors: [{ name: "LeipzigStay" }],
  openGraph: {
    title: "The Augustus Loft Leipzig — Luxury 2-Bedroom Designer Apartment",
    description:
      "Book your stay directly with best rate guarantee. Historic elegance meets contemporary comfort in Leipzig city center.",
    url: "https://leipzigstay.de",
    siteName: "LeipzigStay",
    images: [
      {
        url: "/pictures/ij_LTHfJV-large.jpg",
        width: 1600,
        height: 1067,
        alt: "The Augustus Loft Leipzig Living Room",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#fdfdfc] text-stone-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
