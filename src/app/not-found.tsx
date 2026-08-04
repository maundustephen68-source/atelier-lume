import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-content flex-col items-center justify-center px-5 text-center">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">404</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">This frame doesn't exist.</h1>
      <p className="mt-3 max-w-sm text-sm text-muted">
        The page you're looking for may have moved. Try the portfolio, or head back home.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="border border-ink bg-ink px-6 py-3 text-[13px] uppercase tracking-eyebrow text-paper hover:bg-brass hover:border-brass">
          Back home
        </Link>
        <Link href="/portfolio" className="border border-line px-6 py-3 text-[13px] uppercase tracking-eyebrow hover:border-ink">
          View portfolio
        </Link>
      </div>
    </section>
  );
}
