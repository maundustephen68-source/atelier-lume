import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") === "client" ? "client" : "admin";
  await clearAuthCookie(kind);
  return NextResponse.json({ ok: true });
}
