"use client";

import { useEffect, useState } from "react";
import { runClaude } from "@/lib/client";
import { DECODE_SYSTEM, decodeUser, demoDecode, parseDecode, type HookDecode, type QueueItem } from "@/lib/decode";
import { loadDecodes, loadKeys, loadQueue, saveDecodes, saveQueue } from "@/lib/storage";

export function EngineDesk() {
  const [source, setSource] = useState("https://www.instagram.com/reel/DculWYVIiOF/");
  const [decodes, setDecodes] = useState<HookDecode[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState("reels");
  const [slot, setSlot] = useState("today 18:00");

  useEffect(() => {
    setDecodes(loadDecodes());
    setQueue(loadQueue());
  }, []);

  async function decode() {
    setBusy(true);
    setError(null);
    try {
      const keys = loadKeys();
      let parsed: HookDecode;
      if (!keys.anthropic) {
        parsed = { ...demoDecode(), source };
      } else {
        const raw = await runClaude({
          apiKey: keys.anthropic,
          model: keys.claudeModel,
          system: DECODE_SYSTEM,
          user: decodeUser({ source, brand: "direct, proof-led", audience: "UGC desks" }),
        });
        parsed = { id: crypto.randomUUID(), at: new Date().toISOString(), source, raw, ...parseDecode(raw) };
      }
      const next = [parsed, ...decodes.filter((d) => d.id !== parsed.id)];
      setDecodes(next);
      saveDecodes(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decode failed");
    } finally {
      setBusy(false);
    }
  }

  function queuePost() {
    if (!caption.trim()) return;
    const item: QueueItem = { id: crypto.randomUUID(), platform, caption, slot, status: "queued" };
    const next = [item, ...queue];
    setQueue(next);
    saveQueue(next);
    setCaption("");
  }

  return (
    <section className="settings">
      <p className="kicker">RESEARCH → CREATE → DISTRIBUTE → ENGAGE → ORCHESTRATE</p>
      <h1>The five-move engine</h1>
      <p>Stolen from the “62 agents” reel, then cut down. Decode a competitor. Queue a post. Keep a human on the gate.</p>
      {error && <p className="banner">{error}</p>}
      <h2>Hook decoder</h2>
      <textarea rows={4} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste a Reel URL, caption, or transcript" />
      <div className="row">
        <button className="primary" disabled={busy} onClick={decode}>{busy ? "Decoding…" : "Decode hook"}</button>
        <button className="ghost" onClick={() => { const d = demoDecode(); const next = [d, ...decodes.filter((x) => x.id !== d.id)]; setDecodes(next); saveDecodes(next); }}>Load the 62-agent reel</button>
      </div>
      {decodes.slice(0, 4).map((d) => (
        <article key={d.id} className="out">
          <header><h3>{d.hookType.toUpperCase()} · {d.spokenHook}</h3></header>
          <p><strong>On screen:</strong> {d.onScreen}</p>
          <pre>{d.beats.map((b) => `${b.t} [${b.job}] ${b.line}`).join("\n")}</pre>
          <p>{d.whyItWorks.join(" · ")}</p>
          <div className="chips">
            {d.remixes.map((r) => (
              <button key={r.spoken} className="chip" onClick={() => { setCaption(r.spoken); navigator.clipboard.writeText(r.spoken); }}>{r.onScreen}</button>
            ))}
          </div>
        </article>
      ))}
      <h2>Distribute queue</h2>
      <div className="grid2">
        <label>Caption<textarea rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} /></label>
        <label>Slot<input value={slot} onChange={(e) => setSlot(e.target.value)} /></label>
      </div>
      <div className="row">
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="reels">Reels</option>
          <option value="tiktok">TikTok</option>
          <option value="shorts">Shorts</option>
          <option value="x">X</option>
        </select>
        <button className="primary" onClick={queuePost}>Queue</button>
      </div>
      {queue.slice(0, 8).map((q) => (
        <article key={q.id} className="out">
          <header>
            <h3>{q.platform} · {q.slot}</h3>
            <button className="ghost sm" onClick={() => {
              const next = queue.map((x) => x.id === q.id ? { ...x, status: x.status === "queued" ? "posted" : "queued" } as QueueItem : x);
              setQueue(next); saveQueue(next);
            }}>{q.status}</button>
          </header>
          <pre>{q.caption}</pre>
        </article>
      ))}
      <h2>Engage pack</h2>
      <pre>{`FIRST COMMENT\nSteal the brief. 10 hooks before one script.\n\nREPLIES\n- Drop your niche.\n- The brief had a moodboard. No first sentence.\n- Mute test.\n\nDM CAPTURE\nSend HOOK for the 10-line template.`}</pre>
    </section>
  );
}
