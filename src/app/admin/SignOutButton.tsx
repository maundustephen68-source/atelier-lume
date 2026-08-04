"use client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout?kind=admin", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-[12px] uppercase tracking-eyebrow text-muted hover:text-ink"
    >
      Sign out
    </button>
  );
}
