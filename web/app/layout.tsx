import type { Metadata } from "next";
import Link from "next/link";

import DateLine from "@/components/DateLine";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Geoscan — Intelijen Geopolitik",
  description:
    "Portal berita & analisa situasi geopolitik prediktif. Dapat diterjemahkan via Google Translate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="border-b-2 border-ink">
          {/* Top bar */}
          <div className="mx-auto max-w-6xl px-4 flex items-center justify-between py-1 text-[11px] uppercase tracking-wider text-muted">
            <DateLine />
            <span>Edisi Digital · Framework v3.0</span>
          </div>
          {/* Masthead */}
          <div className="border-y border-rule">
            <div className="mx-auto max-w-6xl px-4 py-4 text-center">
              <Link
                href="/"
                className="font-serif font-bold tracking-tight text-4xl md:text-6xl"
              >
                The Geoscan
              </Link>
              <p className="mt-1 text-[12px] md:text-sm uppercase tracking-[0.3em] text-muted">
                Intelijen Geopolitik Prediktif
              </p>
            </div>
          </div>
          {/* Nav */}
          <nav className="mx-auto max-w-6xl px-4 py-2 flex flex-wrap gap-x-5 gap-y-1 justify-center text-[12px] uppercase tracking-wider">
            <Link href="/">Beranda</Link>
            <Link href="/situasi">Situasi</Link>
            <a href="#terbaru">Terbaru</a>
            <span className="text-muted">· Translate: klik kanan → Terjemahkan</span>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

        <footer className="border-t-2 border-ink mt-10">
          <div className="mx-auto max-w-6xl px-4 py-6 text-[12px] text-muted flex flex-col md:flex-row justify-between gap-2">
            <span>© {new Date().getFullYear()} The Geoscan · Geoscan Intelligence System</span>
            <span>Sumber dikurasi & dianalisa otomatis · bukan nasihat finansial</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
