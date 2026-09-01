import type { Job } from "./types";

export function demoJob(): Job {
  const now = new Date().toISOString();
  return {
    id: "demo-ugc-hooks",
    createdAt: now,
    updatedAt: now,
    status: "publish",
    brief: {
      topic: "Why most UGC briefs die in the first 3 seconds",
      audience: "UGC agency producers and solo coaches",
      platforms: ["reels", "tiktok", "shorts"],
      voice: "direct, specific, proof-led",
      notes: "Demo loop. No live API calls.",
      metrics: "",
    },
    outputs: {
      gather: [
        { id: "d1", title: "Retention drops at the first cut", takeaway: "Most UGC dies before the promise is named.", origin: "user" },
        { id: "d2", title: "Briefs without a first line", takeaway: "Agencies send moodboards, not spoken hooks.", origin: "user" },
      ],
      research: {
        thesis: "UGC underperforms when the brief starts with the product, not the interruption. Write 10 hooks before a script.",
        tensions: ["Briefed on colors, not the first sentence"],
        sources: [],
        angles: [{ id: "a1", title: "The brief has no first line", rationale: "Operators feel this daily.", format: "reel" }],
        risks: ["Sounds like creator-bashing if you skip the fix"],
        formats: { reels: "Talking-head + on-screen first line" },
        raw: "",
      },
      hooks: {
        options: [
          { id: "h1", spoken: "Your UGC brief has no first sentence.", onScreen: "NO FIRST LINE", why: "Names the sin." },
          { id: "h2", spoken: "We shot 40 ads. Three survived the first three seconds.", onScreen: "3 / 40 SURVIVED", why: "Number." },
          { id: "h3", spoken: "If the hook needs a caption, the hook is dead.", onScreen: "HOOK OR MUTE", why: "Mute-test." },
        ],
        recommendedId: "h2",
        titles: ["3 out of 40", "No first line"],
        bodyMustDeliver: "Show the 10-hook ritual.",
        raw: "",
      },
      script: {
        spoken: "HOOK: We shot 40 ads. Three survived the first three seconds.\nThe brief had a moodboard. It did not have a first sentence.\nRitual: 10 hooks, pick one, then script.",
        carousel: [{ slide: 1, text: "40 ads. 3 survived." }, { slide: 2, text: "Write 10 hooks first." }],
        captions: { reels: "Steal the 10-hook brief.", tiktok: "Your brief is why the ad dies." },
        hashtags: ["#ugc", "#shortform"],
        raw: "",
      },
      design: { message: "10 hooks before one script.", colors: "ink / volta blue / paper", slides: ["3/40"], imaginePrompts: [], raw: "" },
      publish: {
        captions: { reels: "We shot 40. Three lived.", tiktok: "Write 10 hooks before the script." },
        firstComment: "Template in the next post.",
        windows: "Weekday 11:00–13:00 and 18:00–21:00 local",
        checklist: ["Cover", "Caption", "First comment"],
        trackingFields: ["views", "3s retention", "saves"],
        raw: "",
      },
    },
    gates: {
      hook: { winnerId: "h2", editedLine: "We shot 40 ads. Three survived the first three seconds.", approvedAt: now },
      script: { approvedAt: now, notes: "Demo lock" },
      design: { imageIndex: 0, approvedAt: now },
    },
    logs: [{ at: now, employee: "system", message: "60-second demo loop loaded. No API keys used." }],
  };
}

export const CASE_STUDY = {
  buyer: "UGC agencies and solo coaches",
  promise: "Stop briefing vibes. Start briefing the first sentence.",
  posts: [
    { title: "3 / 40 survived", metric: "41% 3-second retention", note: "Named the miss." },
    { title: "10 hooks before script", metric: "2.4× saves vs prior CTA", note: "Ritual, not a tip." },
    { title: "Mute-test rewrite", metric: "Client reused the template", note: "The sale was the brief." },
  ],
};
