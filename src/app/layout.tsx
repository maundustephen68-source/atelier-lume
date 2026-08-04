import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";

const display = Bodoni_Moda({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atelier Lume Photography — Editorial Portrait & Event Photography",
    template: "%s — Atelier Lume Photography",
  },
  description:
    "Editorial photography studio for portraits, weddings, events, and product shoots. Browse the portfolio and book your session online.",
  openGraph: {
    title: "Atelier Lume Photography",
    description: "Editorial photography for portraits, weddings, events, and products.",
    url: SITE_URL,
    siteName: "Atelier Lume Photography",
    images: ["/og-cover.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier Lume Photography",
    description: "Editorial photography for portraits, weddings, events, and products.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <Analytics />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
