import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signSession, setAuthCookie } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const site = process.env.SITE_URL || "http://localhost:3000";
  if (!token) return NextResponse.redirect(`${site}/account/login?error=missing`);

  const record = await prisma.magicLinkToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(`${site}/account/login?error=expired`);
  }

  await prisma.magicLinkToken.update({ where: { token }, data: { usedAt: new Date() } });

  let client = await prisma.clientUser.findUnique({ where: { email: record.email } });
  if (!client) {
    client = await prisma.clientUser.create({ data: { email: record.email } });
  }

  const session = await signSession({ sub: client.id, email: client.email, role: "client" });
  await setAuthCookie("client", session);

  return NextResponse.redirect(`${site}/account`);
}
