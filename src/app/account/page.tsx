import { redirect } from "next/navigation";
import { requireClientSession } from "@/lib/auth";
import { AccountBookingsClient } from "./AccountBookingsClient";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireClientSession();
  if (!session) redirect("/account/login");

  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Your account</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Signed in as {session.email}</h1>
      <div className="mt-10">
        <AccountBookingsClient />
      </div>
    </section>
  );
}
