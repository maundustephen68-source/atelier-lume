import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-content px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-serif text-lg tracking-wordmark">ATELIER LUME</p>
            <p className="mt-3 max-w-xs text-sm text-paper/60">
              Editorial photography for portraits, weddings, events, and products.
            </p>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-eyebrow text-paper/50">Studio</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/portfolio" className="hover:text-brass">Portfolio</Link></li>
              <li><Link href="/services" className="hover:text-brass">Services &amp; Pricing</Link></li>
              <li><Link href="/about" className="hover:text-brass">About</Link></li>
              <li><Link href="/contact" className="hover:text-brass">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-eyebrow text-paper/50">Account</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/booking" className="hover:text-brass">Book a session</Link></li>
              <li><Link href="/account/login" className="hover:text-brass">Manage my booking</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] uppercase tracking-eyebrow text-paper/50">Legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-brass">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brass">Terms of Service</Link></li>
              <li><Link href="/cancellation-policy" className="hover:text-brass">Cancellation &amp; Refunds</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/40 md:flex-row md:justify-between">
          <span>&copy; {new Date().getFullYear()} Atelier Lume Photography. All rights reserved.</span>
          <span>Nairobi &amp; worldwide by arrangement.</span>
        </div>
      </div>
    </footer>
  );
}
