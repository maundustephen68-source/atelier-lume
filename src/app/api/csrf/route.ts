import { NextResponse } from "next/server";
import { issueCsrfToken } from "@/lib/auth";

export async function GET() {
  const token = await issueCsrfToken();
  return NextResponse.json({ token });
}
