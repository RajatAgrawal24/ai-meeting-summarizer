import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL!;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { summaryId, recipients } = await req.json();
    if (!summaryId || !recipients) {
      return NextResponse.json(
        { error: "Missing summaryId/recipients" },
        { status: 400 }
      );
    }

    const s = await prisma.summary.findUnique({
      where: { id: Number(summaryId) },
    });
    if (!s) {
      return NextResponse.json({ error: "Summary not found" }, { status: 404 });
    }

    // Prepare recipients list
    const list: string[] = String(recipients)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const link = `${APP_URL}/s/${s.share_token}`;

    for (const email of list) {
      try {
        console.log("Sending email to:", email);

        await transporter.sendMail({
          from: `"Meeting Summarizer" <${process.env.SMTP_FROM}>`,
          to: email,
          subject: "Shared Meeting Summary",
          html: `
            <p>Hello,</p>
            <p>A meeting summary was shared with you.</p>
            <p><a href="${link}">Open Summary</a></p>
          `,
        });

        console.log("Email sent:", email);

        // Log success
        await prisma.recipient.create({
          data: { summary_id: s.id, email, status: "SENT", sent_at: new Date() },
        });
      } catch (err) {
        console.error("Failed sending email:", email, err);
        // Log failure
        await prisma.recipient.create({
          data: { summary_id: s.id, email, status: "FAILED" },
        });
      }
    }

    return NextResponse.json({ ok: true, count: list.length });
  } catch (e) {
    return NextResponse.json(
      { error: "Share failed: " + (e as Error).message },
      { status: 500 }
    );
  }
}
