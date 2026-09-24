import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Sarabun } from "next/font/google";
import { siteUrl } from "@/lib/site-config";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
});

/** Carries the flight figures — codes and times want a fixed advance width. */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TGVA — Thai Airways Virtual",
    template: "%s · TGVA",
  },
  description:
    "Thai Airways Virtual (TGVA) is a flight simulation community bringing aviation enthusiasts together through realistic operations, training and events flown in the spirit of Thai Airways.",
  keywords: ["TGVA", "Thai Airways Virtual", "virtual airline", "flight simulation", "group flights"],
  openGraph: {
    type: "website",
    siteName: "TGVA — Thai Airways Virtual",
    title: "TGVA — Thai Airways Virtual",
    description:
      "A flight simulation community bringing aviation enthusiasts together through realistic operations and the warmth of Thai hospitality.",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      /* Declares the smooth scrolling set in globals.css, so route changes jump
         to the top instead of animating the whole page there. */
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${sarabun.variable} ${plexMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
