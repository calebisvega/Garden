import type { Metadata } from "next";
import Script from "next/script";
import { Cutive, Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans-variable",
  display: "swap",
});

const cutive = Cutive({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body-variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Garden",
  description: "Your personal OS — curated streams, live market data, and daily nourishment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${cutive.variable}`}>
      <body className="min-h-dvh bg-[#ECECE8] text-neutral-900">
        <Script id="garden-scroll-top" strategy="beforeInteractive">
          {`if("scrollRestoration" in history){history.scrollRestoration="manual";}if(!window.location.hash){window.scrollTo(0,0);}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
