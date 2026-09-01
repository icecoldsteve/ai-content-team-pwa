"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CASE_STUDY, demoJob } from "@/lib/demo-loop";
import { PRODUCT } from "@/lib/brand";
import { PLANS, type PlanId } from "@/lib/plans";
import { loadJobs, saveJobs } from "@/lib/storage";
import { EMPLOYEES } from "@/lib/employees";
import { PixelAvatar } from "./PixelAvatar";

export function Landing() {
  const router = useRouter();
  function startDemo() {
    const job = demoJob();
    const existing = loadJobs().filter((j) => j.id !== job.id);
    saveJobs([job, ...existing]);
    router.push("/app?demo=1");
  }
  async function checkout(plan: PlanId) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; return; }
    router.push(`/login?plan=${plan}`);
  }
  return (
    <div className="land">
      <header className="land-nav">
        <strong>VOLTA</strong>
        <nav>
          <a href="#proof">Proof</a>
          <a href="#plans">Plans</a>
          <Link href="/login">Log in</Link>
          <Link href="/app/engine">Engine</Link>
          <Link href="/app" className="land-btn">Open desk</Link>
        </nav>
      </header>
      <section className="land-hero">
        <p className="kicker">{PRODUCT.buyer.toUpperCase()}</p>
        <h1>Stop briefing vibes.<span> Brief the first sentence.</span></h1>
        <p className="lede">{PRODUCT.pitch} Seven specialists. You approve the hook, the script, and the visual.</p>
        <div className="row">
          <button className="primary" onClick={startDemo}>60-second demo — no keys</button>
          <Link href="/app/engine" className="ghost">Decode a reel</Link>
        </div>
      </section>
      <section className="land-crew">
        {EMPLOYEES.map((e) => (
          <div key={e.id} className="land-emp">
            <PixelAvatar id={e.id} size={36} />
            <em>{e.title.replace("THE ", "")}</em>
          </div>
        ))}
      </section>
      <section className="land-proof">
        <p className="kicker">THEY SELL 62 AGENTS</p>
        <h2>You need five moves and a gate. Not a swarm.</h2>
        <div className="land-grid">
          {[
            ["01 Research", "Decode the hook. Rank the angle."],
            ["02 Create", "Hook, script, visual — human lock."],
            ["03 Distribute", "Queue + composer. No silent auto-post."],
            ["04 Engage", "First comment, replies, capture line."],
            ["05 Orchestrate", "Seven specialists. Analyst after it ships."],
          ].map(([t, d]) => (
            <article key={t}><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>
      <section id="proof" className="land-proof">
        <p className="kicker">ONE BUYER · THREE POSTS</p>
        <h2>{CASE_STUDY.promise}</h2>
        <div className="land-grid">
          {CASE_STUDY.posts.map((p) => (
            <article key={p.title}>
              <h3>{p.title}</h3>
              <strong>{p.metric}</strong>
              <p>{p.note}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="plans" className="land-plans">
        <p className="kicker">ACCESS · NOT A ZIP</p>
        <h2>Three desks.</h2>
        <div className="land-grid3">
          {PLANS.map((p) => (
            <article key={p.id}>
              <h3>{p.name}</h3>
              <p className="price">{p.price}<small>/mo</small></p>
              <p>{p.blurb}</p>
              <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <button className="primary" onClick={() => checkout(p.id)}>Choose {p.name}</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
