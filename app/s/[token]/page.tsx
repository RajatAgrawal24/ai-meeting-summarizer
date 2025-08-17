import { prisma } from "@/lib/prisma";

export default async function SharePage({ params }: { params: { token: string } }) {
  const summary = await prisma.summary.findFirst({ where: { share_token: params.token } });
  if (!summary) return <main className="p-6">Not found</main>;
  return (
    <main className="p-6" style={{ maxWidth: 800 }}>
      <h1>Shared Summary</h1>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{summary.summary_text}</pre>
    </main>
  );
}
