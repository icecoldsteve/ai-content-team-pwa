"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUCT } from "@/lib/brand";
import { runClaude, runGather, runImagine } from "@/lib/client";
import { EMPLOYEES, PIPELINE, PLATFORMS } from "@/lib/employees";
import {
  parseAnalysis, parseDesign, parseHooks, parsePlan, parsePublish, parseResearch, parseScript,
} from "@/lib/parse";
import {
  applyRoleOutput, approveDesign, approveHook, approveScript, MAKE_ORDER, roleBlocked,
} from "@/lib/pipeline";
import { imaginePrompts, systemFor, userFor } from "@/lib/prompts";
import {
  defaultBrand, defaultKeys, loadBrand, loadJobs, loadKeys, loadLearnings, loadPublished,
  saveBrand, saveJobs, saveKeys, saveLearnings, savePublished, type ApiKeys,
} from "@/lib/storage";
import type { BrandKit, Brief, EmployeeId, Job, Learning, PublishedItem } from "@/lib/types";
import { PixelAvatar } from "./PixelAvatar";

type View = "hq" | "team" | "job" | "memory";

const emptyBrief = (): Brief => ({
  topic: "",
  audience: "",
  platforms: ["reels", "tiktok", "shorts"],
  voice: "direct, specific, proof-led, no fluff",
  notes: "",
  metrics: "",
});

export function HQApp() {
  const [view, setView] = useState<View>("hq");
  const [keys, setKeys] = useState<ApiKeys>(defaultKeys());
  const [brand, setBrand] = useState<BrandKit>(defaultBrand());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [published, setPublished] = useState<PublishedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief>(emptyBrief());
  const [busy, setBusy] = useState<EmployeeId | "loop" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hookPick, setHookPick] = useState("");
  const [hookLine, setHookLine] = useState("");
  const [scriptNotes, setScriptNotes] = useState("");
  const [imagePick, setImagePick] = useState(0);
  const [postUrl, setPostUrl] = useState("");
  const [postPlatform, setPostPlatform] = useState("reels");
  const [postMetrics, setPostMetrics] = useState("");

  useEffect(() => {
    setKeys(loadKeys());
    setBrand(loadBrand());
    setJobs(loadJobs());
    setLearnings(loadLearnings());
    setPublished(loadPublished());
  }, []);
  useEffect(() => { saveJobs(jobs); }, [jobs]);

  const job = jobs.find((j) => j.id === activeId) || null;

  function persist(next: Job) {
    setJobs((prev) => {
      const i = prev.findIndex((j) => j.id === next.id);
      if (i === -1) return [next, ...prev];
      const copy = [...prev];
      copy[i] = next;
      return copy;
    });
  }

  function startJob() {
    if (!brief.topic.trim()) { setError("Give Volta a topic first."); return; }
    if (!brief.platforms.length) { setError("Pick at least one platform."); return; }
    const now = new Date().toISOString();
    const created: Job = {
      id: crypto.randomUUID(), createdAt: now, updatedAt: now, status: "research", brief,
      outputs: {}, gates: {},
      logs: [{ at: now, employee: "system", message: "Loop opened." }],
    };
    persist(created); setActiveId(created.id); setView("job"); setError(null);
  }

  async function executeRole(current: Job, id: EmployeeId): Promise<Job> {
    const blocked = roleBlocked(current, id);
    if (blocked) throw new Error(blocked);
    let working = current;
    if (id === "researcher") {
      const gathered = await runGather(keys, current.brief.topic);
      working = { ...current, outputs: { ...current.outputs, gather: gathered } };
      persist(working);
    }
    const text = await runClaude(keys, systemFor(id), userFor(id, working, brand, learnings, published));
    let next = working;
    if (id === "researcher") next = applyRoleOutput(working, id, { research: parseResearch(text, working.outputs.gather || []) });
    if (id === "hook") next = applyRoleOutput(working, id, { hooks: parseHooks(text) });
    if (id === "script") next = applyRoleOutput(working, id, { script: parseScript(text) });
    if (id === "designer") {
      const design = parseDesign(text);
      next = applyRoleOutput(working, id, { design });
      persist(next);
      if (keys.xai) {
        const images: { url: string; prompt: string; b64?: string }[] = [];
        for (const item of imaginePrompts({ ...next, outputs: { ...next.outputs, design } })) {
          try {
            const made = await runImagine(keys, item.prompt, item.aspect);
            made.forEach((img) => images.push({ url: img.url, prompt: item.prompt, b64: img.b64 }));
          } catch { /* keep going */ }
        }
        next = { ...next, outputs: { ...next.outputs, design, images } };
      }
    }
    if (id === "publisher") next = applyRoleOutput(working, id, { publish: parsePublish(text) });
    if (id === "analyst") {
      const analysis = parseAnalysis(text);
      next = applyRoleOutput(working, id, { analysis });
      const item: Learning = {
        id: crypto.randomUUID(), at: new Date().toISOString(), jobId: current.id,
        topic: current.brief.topic, experiments: analysis.experiments,
        researchQuestions: analysis.researchQuestions, notes: analysis.observations.join(" "),
      };
      const list = [item, ...learnings];
      setLearnings(list); saveLearnings(list);
    }
    if (id === "manager") next = applyRoleOutput(working, id, { plan: parsePlan(text) });
    persist(next);
    return next;
  }

  async function runRole(target: Job, id: EmployeeId) {
    setError(null); setBusy(id);
    try {
      const next = await executeRole(target, id);
      if (id === "hook" && next.outputs.hooks) {
        setHookPick(next.outputs.hooks.recommendedId);
        const win = next.outputs.hooks.options.find((o) => o.id === next.outputs.hooks!.recommendedId);
        setHookLine(win?.spoken || "");
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Role failed"); }
    finally { setBusy(null); }
  }

  async function runUntilGate(target: Job) {
    setError(null); setBusy("loop");
    let current = target;
    try {
      for (const id of MAKE_ORDER) {
        const blocked = roleBlocked(current, id);
        if (blocked) { setError(blocked); break; }
        setBusy(id);
        current = await executeRole(current, id);
        if (id === "hook" || id === "script" || id === "designer") {
          if (id === "hook" && current.outputs.hooks) {
            setHookPick(current.outputs.hooks.recommendedId);
            const win = current.outputs.hooks.options.find((o) => o.id === current.outputs.hooks!.recommendedId);
            setHookLine(win?.spoken || "");
          }
          setError("Approval needed before the loop continues.");
          break;
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Loop stopped"); }
    finally { setBusy(null); }
  }

  function markPosted(target: Job) {
    if (!postUrl.trim()) { setError("Paste the live URL after you publish."); return; }
    const posted = { url: postUrl.trim(), platform: postPlatform, at: new Date().toISOString(), metrics: postMetrics };
    persist({ ...target, posted, brief: { ...target.brief, metrics: postMetrics || target.brief.metrics } });
    const item: PublishedItem = {
      id: crypto.randomUUID(), jobId: target.id, topic: target.brief.topic,
      url: posted.url, platform: posted.platform, at: posted.at, metrics: posted.metrics,
    };
    const list = [item, ...published];
    setPublished(list); savePublished(list); setError(null);
  }

  const outputCards = useMemo(() => {
    if (!job) return [];
    return [
      job.outputs.research && { id: "researcher" as const, title: "Research brief", body: job.outputs.research.thesis },
      job.outputs.script && { id: "script" as const, title: "Script", body: job.outputs.script.spoken },
      job.outputs.design && { id: "designer" as const, title: "Design", body: job.outputs.design.message },
      job.outputs.publish && { id: "publisher" as const, title: "Publish pack", body: JSON.stringify(job.outputs.publish.captions, null, 2) },
      job.outputs.analysis && { id: "analyst" as const, title: "Analysis", body: job.outputs.analysis.experiments.join("\n") },
      job.outputs.plan && { id: "manager" as const, title: "Ops plan", body: `${job.outputs.plan.nextAction}\n\n${job.outputs.plan.calendar}` },
    ].filter(Boolean) as { id: EmployeeId; title: string; body: string }[];
  }, [job]);

  return (
    <div className="hq">
      <header className="topbar">
        <button className="brand" onClick={() => setView("hq")}>
          <span className="brand-mark">VO</span>
          <span><strong>{PRODUCT.name.toUpperCase()}</strong><em>{PRODUCT.tagline}</em></span>
        </button>
        <nav>
          <button className={view === "hq" ? "on" : ""} onClick={() => setView("hq")}>Loop</button>
          <button className={view === "team" ? "on" : ""} onClick={() => setView("team")}>Crew</button>
          <button className={view === "memory" ? "on" : ""} onClick={() => setView("memory")}>Memory</button>
        </nav>
      </header>
      {error && <div className="banner"><span>{error}</span><button onClick={() => setError(null)}>dismiss</button></div>}
      {view === "hq" && (
        <section className="stage">
          <p className="kicker">MAKE → APPROVE → PUBLISH → LEARN</p>
          <h1>{PRODUCT.name.toUpperCase()}<br /><span>RUNS THE CREW</span></h1>
          <p className="lede">{PRODUCT.pitch} Live sources. Human gates. Analyst after something ships.</p>
          <div className="brief-card">
            <label>What should the crew make?<textarea rows={3} value={brief.topic} onChange={(e) => setBrief({ ...brief, topic: e.target.value })} /></label>
            <div className="grid2">
              <label>Audience<input value={brief.audience} onChange={(e) => setBrief({ ...brief, audience: e.target.value })} /></label>
              <label>Voice<input value={brief.voice} onChange={(e) => setBrief({ ...brief, voice: e.target.value })} /></label>
            </div>
            <div className="chips">
              {PLATFORMS.map((p) => {
                const on = brief.platforms.includes(p.id);
                return <button key={p.id} className={on ? "chip on" : "chip"} onClick={() => setBrief({ ...brief, platforms: on ? brief.platforms.filter((x) => x !== p.id) : [...brief.platforms, p.id] })}>{p.label}</button>;
              })}
            </div>
            <label>Notes<textarea rows={2} value={brief.notes} onChange={(e) => setBrief({ ...brief, notes: e.target.value })} /></label>
            <div className="row">
              <button className="primary" onClick={startJob}>Open a loop</button>
              <button className="ghost" onClick={() => setView("memory")}>Brand & keys</button>
            </div>
          </div>
          {jobs.length > 0 && (
            <div className="archive">
              <h2>Recent loops</h2>
              {jobs.slice(0, 10).map((j) => (
                <button key={j.id} className="archive-row" onClick={() => { setActiveId(j.id); setView("job"); }}>
                  <em>{j.status}</em><strong>{j.brief.topic}</strong>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      {view === "team" && (
        <section className="team-grid">
          {EMPLOYEES.map((e) => (
            <article key={e.id} className="emp">
              <header><span>EMPLOYEE {e.number} / 07</span><PixelAvatar id={e.id} size={64} /></header>
              <h2 style={{ color: e.color }}>{e.title}</h2><p>{e.tagline}</p>
            </article>
          ))}
        </section>
      )}
      {view === "job" && !job && <section className="empty"><p>No loop selected.</p></section>}
      {view === "job" && job && (
        <section className="workspace">
          <aside>
            <p className="kicker">{job.brief.topic}</p>
            <ol className="pipe">
              {PIPELINE.map((p, i) => {
                const idx = PIPELINE.findIndex((x) => x.id === job.status);
                const done = job.status === "done" || idx > i;
                const current = p.id === job.status;
                const blocked = p.employee ? roleBlocked(job, p.employee) : "—";
                return (
                  <li key={p.id} className={current ? "cur" : done ? "done" : ""}>
                    <button disabled={!p.employee || busy !== null || !!blocked} onClick={() => p.employee && runRole(job, p.employee)}>{p.label}</button>
                  </li>
                );
              })}
            </ol>
            <button className="primary full" disabled={busy !== null} onClick={() => runUntilGate(job)}>{busy ? `Running ${busy}…` : "Run until next approval"}</button>
          </aside>
          <main>
            {job.outputs.gather && job.outputs.gather.length > 0 && (
              <article className="out"><header><h3>Live sources</h3></header>
                <ul>{job.outputs.gather.map((s) => <li key={s.id}><b>[{s.origin}]</b> {s.title}</li>)}</ul>
              </article>
            )}
            {job.outputs.hooks && !job.gates.hook && (
              <article className="out">
                <header><PixelAvatar id="hook" size={28} /><h3>Approve a hook</h3></header>
                <div className="chips">{job.outputs.hooks.options.map((o) => (
                  <button key={o.id} className={hookPick === o.id ? "chip on" : "chip"} onClick={() => { setHookPick(o.id); setHookLine(o.spoken); }}>{o.id}</button>
                ))}</div>
                <textarea rows={3} value={hookLine} onChange={(e) => setHookLine(e.target.value)} />
                <button className="primary" onClick={() => persist(approveHook(job, hookPick || job.outputs.hooks!.recommendedId, hookLine))}>Lock hook</button>
              </article>
            )}
            {job.outputs.script && !job.gates.script && (
              <article className="out">
                <header><h3>Approve script</h3></header>
                <pre>{job.outputs.script.spoken}</pre>
                <input value={scriptNotes} onChange={(e) => setScriptNotes(e.target.value)} placeholder="Notes" />
                <button className="primary" onClick={() => persist(approveScript(job, scriptNotes))}>Lock script</button>
              </article>
            )}
            {job.outputs.images && job.outputs.images.length > 0 && (
              <div className="shots">{job.outputs.images.map((img, i) => (
                <figure key={i} className={imagePick === i ? "picked" : ""} onClick={() => setImagePick(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" />
                </figure>
              ))}</div>
            )}
            {job.outputs.design && !job.gates.design && (
              <article className="out">
                <header><h3>Approve visual</h3></header>
                <button className="primary" onClick={() => persist(approveDesign(job, imagePick))}>Lock visual #{imagePick + 1}</button>
              </article>
            )}
            {job.outputs.publish && (
              <article className="out">
                <header><h3>I posted it</h3></header>
                <input value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="Live URL" />
                <input value={postPlatform} onChange={(e) => setPostPlatform(e.target.value)} />
                <textarea rows={2} value={postMetrics} onChange={(e) => setPostMetrics(e.target.value)} placeholder="Metrics" />
                <button className="primary" onClick={() => markPosted(job)}>Save to memory</button>
              </article>
            )}
            {outputCards.map((s) => (
              <article key={s.id} className="out">
                <header><PixelAvatar id={s.id} size={28} /><h3>{s.title}</h3>
                  <button className="ghost sm" onClick={() => navigator.clipboard.writeText(s.body)}>Copy</button>
                </header>
                <pre>{s.body}</pre>
              </article>
            ))}
          </main>
        </section>
      )}
      {view === "memory" && (
        <section className="settings">
          <h1>Memory & keys</h1>
          <label>Anthropic<input type="password" value={keys.anthropic} onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })} /></label>
          <label>xAI<input type="password" value={keys.xai} onChange={(e) => setKeys({ ...keys, xai: e.target.value })} /></label>
          <label>Voice<input value={brand.voice} onChange={(e) => setBrand({ ...brand, voice: e.target.value })} /></label>
          <label>Audience<input value={brand.audience} onChange={(e) => setBrand({ ...brand, audience: e.target.value })} /></label>
          <label>Pillars<textarea rows={2} value={brand.pillars} onChange={(e) => setBrand({ ...brand, pillars: e.target.value })} /></label>
          <label>Offer<textarea rows={2} value={brand.offer} onChange={(e) => setBrand({ ...brand, offer: e.target.value })} /></label>
          <label>Proof<textarea rows={2} value={brand.proof} onChange={(e) => setBrand({ ...brand, proof: e.target.value })} /></label>
          <button className="primary" onClick={() => { saveKeys(keys); saveBrand(brand); setView("hq"); }}>Save</button>
          {learnings.slice(0, 8).map((l) => (
            <article key={l.id} className="out"><header><h3>{l.topic}</h3></header><pre>{l.researchQuestions.join("\n")}</pre></article>
          ))}
        </section>
      )}
    </div>
  );
}
