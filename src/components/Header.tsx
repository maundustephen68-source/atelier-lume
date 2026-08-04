"use client";
import Link from "next/link";
import { useState } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4 md:px-8">
        <Link
          href="/"
          className="font-serif text-lg tracking-wordmark text-ink focus-ring"
          aria-label="Atelier Lume Photography, home"
        >
          ATELIER LUME
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[13px] uppercase tracking-eyebrow text-ink/80 transition hover:text-brass focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setLeadOpen(true)}
            className="text-[13px] uppercase tracking-eyebrow text-ink/80 transition hover:text-brass focus-ring"
          >
            Get in Touch
          </button>
          <Link
            href="/booking"
            className="border border-ink bg-ink px-5 py-2.5 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass focus-ring"
          >
            Book Now
          </Link>
        </div>

        <button
          className="p-2 md:hidden focus-ring"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="mt-1.5 block h-px w-6 bg-ink" />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm uppercase tracking-eyebrow"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              className="text-left text-sm uppercase tracking-eyebrow"
              onClick={() => {
                setLeadOpen(true);
                setMenuOpen(false);
              }}
            >
              Get in Touch
            </button>
            <Link
              href="/booking"
              className="mt-2 border border-ink bg-ink px-5 py-3 text-center text-sm uppercase tracking-eyebrow text-paper"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}

      <LeadCaptureModal open={leadOpen} onClose={() => setLeadOpen(false)} />
    </header>
  );
}
