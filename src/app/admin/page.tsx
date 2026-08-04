import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { SignOutButton } from "./SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Server-side role check on every request - never inferred from the UI.
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <section className="mx-auto max-w-content px-5 py-12 md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-eyebrow text-brass">Admin</p>
          <h1 className="mt-1 font-serif text-3xl text-ink">Dashboard</h1>
        </div>
        <SignOutButton />
      </div>
      <div className="mt-8">
        <AdminDashboardClient />
      </div>
    </section>
  );
}
