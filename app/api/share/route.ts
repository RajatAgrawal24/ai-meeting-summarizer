import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const APP_URL = process.env.APP_URL!;

export async function POST(req: Request) {
  try {
    const { summaryId, recipients } = await req.json();
    if (!summaryId || !recipients) {
      return NextResponse.json({ error: "Missing summaryId/recipients" }, { status: 400 });
    }

    const s = await prisma.summary.findUnique({ where: { id: Number(summaryId) } });
    if (!s) return NextResponse.json({ error: "Summary not found" }, { status: 404 });

    const list: string[] = String(recipients)
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    const link = `${APP_URL}/s/${s.share_token}`;
    for (const email of list) {
      try {
        console.log("Sending email to:", email);
        const c = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: email,
          subject: "Shared Meeting Summary",
          html: `<p>Hello,</p><p>A meeting summary was shared with you.</p><p><a href="${link}">Open Summary</a></p>`,
        });
        console.log("Email sent:", c);
        await prisma.recipient.create({ data: { summary_id: s.id, email, status: "SENT", sent_at: new Date() } });
      } catch {
        await prisma.recipient.create({ data: { summary_id: s.id, email, status: "FAILED" } });
      }
    }

    return NextResponse.json({ ok: true, count: list.length });
  } catch (e) {
    return NextResponse.json({ error: "Share failed" }, { status: 500 });
  }
}
