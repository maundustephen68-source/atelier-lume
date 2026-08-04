import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [lastEmailSent, lastWhatsappSent, recentFailures] = await Promise.all([
    prisma.notificationLog.findFirst({ where: { channel: "email", status: "sent" }, orderBy: { sentAt: "desc" } }),
    prisma.notificationLog.findFirst({ where: { channel: "whatsapp", status: "sent" }, orderBy: { sentAt: "desc" } }),
    prisma.notificationLog.findMany({
      where: { status: "failed", sentAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { sentAt: "desc" },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    email: {
      configured: Boolean(process.env.RESEND_API_KEY),
      lastSuccessAt: lastEmailSent?.sentAt || null,
    },
    whatsapp: {
      configured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      lastSuccessAt: lastWhatsappSent?.sentAt || null,
    },
    recentFailures24h: recentFailures,
  });
}
