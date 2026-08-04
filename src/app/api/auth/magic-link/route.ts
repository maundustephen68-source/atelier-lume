import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { Resend } from "resend";

const schema = z.object({ email: z.string().trim().email() });
const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`magic:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.magicLinkToken.create({ data: { email: parsed.data.email, token, expiresAt } });

  const site = process.env.SITE_URL || "http://localhost:3000";
  const link = `${site}/api/auth/magic-link/verify?token=${token}`;
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "bookings@atelierlume.com",
      to: parsed.data.email,
      subject: "Your Atelier Lume sign-in link",
      html: `<p>Click to sign in (expires in 15 minutes): <a href="${link}">${link}</a></p>`,
    });
  } catch {
    // Still return success generically - avoid confirming which emails exist
    // and avoid failing the whole request over an email hiccup the user
    // can just retry.
  }

  return NextResponse.json({ ok: true, message: "If that email has bookings, a link is on its way." });
}
