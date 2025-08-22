import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const { summary_text } = await req.json();

    if (!summary_text) {
      return NextResponse.json(
        { error: "Missing summary_text" },
        { status: 400 }
      );
    }

    await prisma.summary.update({
      where: { id: Number(id) },
      data: { summary_text },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Update failed" + e}, { status: 500 });
  }
}
