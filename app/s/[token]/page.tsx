import { prisma } from "@/lib/prisma";

export default async function SharePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const summary = await prisma.summary.findFirst({
    where: { share_token: token },
  });

  if (!summary) return <main className="p-6">Not found</main>;

  return (
    <main className="p-6" style={{ maxWidth: 800 }}>
      <h1 className="text-xl font-bold mb-4">Shared Summary</h1>
      <pre className="whitespace-pre-wrap">{summary.summary_text}</pre>
    </main>
  );
}

