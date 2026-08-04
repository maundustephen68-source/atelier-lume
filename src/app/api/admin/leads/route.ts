import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, verifyCsrf } from "@/lib/auth";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ leads });
}

const patchSchema = z.object({
  id: z.string(),
  status: z.enum(["new", "contacted", "converted", "lost"]),
});

export async function PATCH(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "Invalid request" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const lead = await prisma.lead.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } });
  return NextResponse.json({ lead });
}
