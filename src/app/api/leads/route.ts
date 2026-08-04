import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`lead:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // honeypot field silently accepted-but-discarded so bots don't learn
  const { website, ...data } = parsed.data;

  const lead = await prisma.lead.create({ data });
  return NextResponse.json({ id: lead.id }, { status: 201 });
}
