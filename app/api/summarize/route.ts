import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groq } from "@/lib/groq";
import { randomUUID } from "crypto";

export const maxDuration = 30; // Vercel edge hint; OK to remove
export async function POST(req: Request) {
  try {
    const { transcript, instruction } = await req.json();
    if (!transcript || !instruction) {
      return NextResponse.json({ error: "Missing transcript/instruction" }, { status: 400 });
    }

    const system = `You are an assistant that produces concise, structured meeting summaries.
- Follow the user's style instruction.
- If action items requested, include "Action Items" with owner and due.
- No hallucinations; use "Not specified" for missing info.
- Keep it under 300 words unless asked otherwise.`;

    const user = `TRANSCRIPT:\n${transcript}\n\nINSTRUCTION:\n${instruction}\n\nOUTPUT FORMAT:
- Start with a title line
- Use "-" bullets for lists
- For action items: "- [Owner]: Task (Due: YYYY-MM-DD or Not specified)"`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim() || "";
    const saved = await prisma.summary.create({
      data: {
        original_text: transcript,
        prompt: instruction,
        summary_text: summary,
        share_token: randomUUID(),
      },
    });

    return NextResponse.json({ id: saved.id, summary: saved.summary_text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to summarize" }, { status: 500 });
  }
}
