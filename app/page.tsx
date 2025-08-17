"use client";
import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [instruction, setInstruction] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryId, setSummaryId] = useState<number | null>(null);
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);

  const onFile = async (f: File) => setTranscript(await f.text());

  const generate = async () => {
    if (!transcript || !instruction) return alert("Transcript & instruction required");
    setLoading(true);
    try {
      const r = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, instruction }),
      }).then(res => res.json());
      if (r.error) return alert(r.error);
      setSummary(r.summary);
      setSummaryId(r.id);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!summaryId) return alert("Generate first");
    const r = await fetch(`/api/summaries/${summaryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary_text: summary }),
    }).then(res => res.json());
    if (r.error) return alert(r.error);
    alert("Saved");
  };

  const share = async () => {
    if (!summaryId) return alert("Generate & save first");
    const r = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryId, recipients: emails }),
    }).then(res => res.json());
    if (r.error) return alert(r.error);
    alert(`Shared to ${r.count} recipient(s)`);
  };

  return (
    <main style={{ padding: 16, maxWidth: 800, margin: "0 auto" }}>
      <h1>AI Meeting Summarizer</h1>

      <label>Upload .txt transcript</label><br/>
      <input type="file" accept=".txt" onChange={e => e.target.files && onFile(e.target.files[0])} />

      <div style={{ marginTop: 12 }}>
        <label>Or paste transcript</label>
        <textarea rows={8} style={{ width: "100%" }} value={transcript} onChange={e => setTranscript(e.target.value)} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Instruction / Prompt</label>
        <input style={{ width: "100%" }} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="e.g., Bullet points for executives" />
      </div>

      <button style={{ marginTop: 12 }} onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate Summary"}</button>

      <div style={{ marginTop: 12 }}>
        <label>Summary (editable)</label>
        <textarea rows={12} style={{ width: "100%" }} value={summary} onChange={e => setSummary(e.target.value)} />
        <button style={{ marginTop: 8 }} onClick={save}>Save Edits</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>Share via email (comma-separated)</label>
        <input style={{ width: "100%" }} value={emails} onChange={e => setEmails(e.target.value)} placeholder="a@x.com, b@y.com" />
        <button style={{ marginTop: 8 }} onClick={share}>Share</button>
      </div>
    </main>
  );
}
