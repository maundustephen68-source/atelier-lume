import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, signSession, setAuthCookie } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!ok) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  // Constant-shaped response whether the email exists or not, to avoid
  // leaking which admin emails are registered.
  const validPassword = user ? await verifyPassword(parsed.data.password, user.hashedPassword) : false;
  if (!user || !validPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signSession({ sub: user.id, email: user.email, role: user.role as "owner" | "staff" });
  await setAuthCookie("admin", token);
  return NextResponse.json({ ok: true });
}
