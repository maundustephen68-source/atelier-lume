import { NextResponse } from "next/server";
import { runDueReminders } from "@/lib/reminders";

// Called by Vercel Cron (see vercel.json) or any external scheduler.
// Protected by a shared secret - never triggered by the browser.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const results = await runDueReminders();
  return NextResponse.json(results);
}
