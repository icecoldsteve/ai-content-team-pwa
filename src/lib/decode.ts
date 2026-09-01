export interface HookDecode {
  id: string;
  at: string;
  source: string;
  spokenHook: string;
  onScreen: string;
  hookType: string;
  beats: { t: string; job: string; line: string }[];
  whyItWorks: string[];
  remixes: { spoken: string; onScreen: string; why: string }[];
  raw: string;
}

export interface QueueItem {
  id: string;
  jobId?: string;
  platform: string;
  caption: string;
  slot: string;
  status: "queued" | "sent" | "posted";
}

export const DECODE_SYSTEM = `You decode short-form videos for Volta. Return ONE JSON object only.
JSON:
{"spokenHook":"","onScreen":"","hookType":"callout|number|contrarian|mute-test|story|warning","beats":[{"t":"0-3s","job":"HOOK","line":""}],"whyItWorks":["..."],"remixes":[{"spoken":"","onScreen":"","why":""}]}
Give exactly 3 remixes in the brand voice. Never invent view counts.`;

export function decodeUser(input: { source: string; brand: string; audience: string }) {
  return `SOURCE (url, caption, or transcript):\n${input.source}\n\nBRAND VOICE: ${input.brand}\nAUDIENCE: ${input.audience}\nDecode the first 3 seconds, the beat map, and 3 remixed hooks this desk could shoot.`;
}

export function parseDecode(raw: string): Omit<HookDecode, "id" | "at" | "source" | "raw"> {
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const blob = fence ? fence[1] : raw;
  const start = blob.indexOf("{");
  const end = blob.lastIndexOf("}");
  const json = JSON.parse(blob.slice(start, end + 1));
  return {
    spokenHook: String(json.spokenHook || ""),
    onScreen: String(json.onScreen || ""),
    hookType: String(json.hookType || "callout"),
    beats: Array.isArray(json.beats) ? json.beats : [],
    whyItWorks: Array.isArray(json.whyItWorks) ? json.whyItWorks.map(String) : [],
    remixes: Array.isArray(json.remixes) ? json.remixes : [],
  };
}

export function demoDecode(): HookDecode {
  return {
    id: "decode-62-agents",
    at: new Date().toISOString(),
    source: "instagram.com/reel/DculWYVIiOF — structurewebworks",
    spokenHook: "I built 62 AI agents to run your entire social media team.",
    onScreen: "62 AGENTS",
    hookType: "number",
    beats: [
      { t: "0-3s", job: "HOOK", line: "62 agents. Entire social team." },
      { t: "3-15s", job: "MAP", line: "Research, Create, Distribute, Engage, Orchestrate." },
      { t: "15-25s", job: "PROOF", line: "Scrape viral videos, decode hooks, rank trends." },
      { t: "25-35s", job: "CTA", line: "Comment which system to build next." },
    ],
    whyItWorks: [
      "Big specific number in second one.",
      "Maps a messy stack into five named moves.",
      "Ends on a comment prompt, not a link-in-bio.",
    ],
    remixes: [
      { spoken: "You do not need 62 agents. You need 7 specialists and a gate.", onScreen: "7 NOT 62", why: "Contrarian on their hook." },
      { spoken: "We shot 40 UGC ads. Three survived the first three seconds.", onScreen: "3 / 40", why: "Number + proof." },
      { spoken: "If the hook needs a caption, the hook is dead.", onScreen: "MUTE TEST", why: "Mute-test callout." },
    ],
    raw: "",
  };
}
