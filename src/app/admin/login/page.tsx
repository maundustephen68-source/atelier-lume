"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-20">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Owner access</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Admin sign in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line bg-white px-4 py-3 text-sm focus-ring"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line bg-white px-4 py-3 text-sm focus-ring"
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          disabled={loading}
          className="w-full border border-ink bg-ink py-3 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass disabled:opacity-60 focus-ring"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}
