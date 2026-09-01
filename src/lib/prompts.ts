import type { BrandKit, Brief, EmployeeId, Job, Learning, PublishedItem } from "./types";

function briefBlock(brief: Brief, brand: BrandKit) {
  return `TOPIC: ${brief.topic}
AUDIENCE: ${brief.audience || brand.audience || "general creator audience"}
PLATFORMS: ${brief.platforms.join(", ") || "reels, tiktok, shorts"}
BRAND VOICE: ${brief.voice || brand.voice}
OFFER: ${brand.offer || "none stated"}
PROOF WE ALREADY HAVE: ${brand.proof || "none stated"}
PILLARS: ${brand.pillars || "none stated"}
NEVER DO: ${brand.banned}
NOTES: ${brief.notes || "none"}
${brief.metrics ? `LIVE / PAST METRICS:\n${brief.metrics}` : ""}`;
}

function memoryBlock(learnings: Learning[], published: PublishedItem[]) {
  const q = learnings.slice(0, 8).flatMap((l) => l.researchQuestions).slice(0, 12);
  const shipped = published.slice(0, 8).map((p) => `${p.topic} (${p.platform}) ${p.metrics || ""}`);
  return `## COMPOUNDING MEMORY\nRecent research questions:\n${q.length ? q.map((x) => `- ${x}`).join("\n") : "- none yet"}\nRecently shipped:\n${shipped.length ? shipped.map((x) => `- ${x}`).join("\n") : "- none yet"}`;
}

export function systemFor(id: EmployeeId): string {
  const common = `You are one specialist inside Volta, a 7-person AI content company. One job only.\nNever invent statistics, quotes, or URLs. If uncertain, label it hypothesis.\nReturn ONE JSON object only. No markdown outside JSON.`;
  const map: Record<EmployeeId, string> = {
    researcher: `${common}\nYou are THE RESEARCHER. Use ONLY gathered sources plus labeled hypotheses.\nJSON shape: {"thesis":"","tensions":[],"sources":[],"angles":[],"risks":[],"formats":{}}\nGive exactly 5 angles.`,
    hook: `${common}\nYou are THE HOOK WRITER.\nJSON shape: {"options":[{"id":"h1","spoken":"","onScreen":"","why":""}],"recommendedId":"h1","titles":[],"bodyMustDeliver":""}\nWrite 10 options.`,
    script: `${common}\nYou are THE SCRIPT WRITER. Honor the APPROVED HOOK as the first line.\nJSON shape: {"spoken":"","carousel":[],"captions":{},"hashtags":[]}`,
    designer: `${common}\nYou are THE DESIGNER.\nJSON shape: {"message":"","colors":"","slides":[],"imaginePrompts":["p1","p2","p3"]}\nOne 9:16 cover and one 1:1 thumbnail. No logos.`,
    analyst: `${common}\nYou are THE ANALYST.\nJSON shape: {"observations":[],"interpretations":[],"hypotheses":[],"keep":[],"kill":[],"experiments":[],"researchQuestions":[]}`,
    manager: `${common}\nYou are THE MANAGER.\nJSON shape: {"calendar":"","spinoffs":[],"checklist":[],"nextAction":""}`,
    publisher: `${common}\nYou are THE PUBLISHER. Never claim it was published.\nJSON shape: {"captions":{},"firstComment":"","windows":"","checklist":[],"trackingFields":[]}`,
  };
  return map[id];
}

export function userFor(id: EmployeeId, job: Job, brand: BrandKit, learnings: Learning[], published: PublishedItem[]) {
  const parts: string[] = [briefBlock(job.brief, brand), memoryBlock(learnings, published)];
  if (job.outputs.gather?.length) {
    parts.push("## GATHERED SOURCES\n" + job.outputs.gather.map((s) => `- [${s.origin}] ${s.title}`).join("\n"));
  }
  if (job.outputs.research) parts.push(`## RESEARCH\n${job.outputs.research.thesis}`);
  if (job.gates.hook) parts.push(`## APPROVED HOOK\n${job.gates.hook.editedLine}`);
  if (job.outputs.script) parts.push(`## SCRIPT\n${job.outputs.script.spoken}`);
  if (job.gates.script) parts.push("## SCRIPT APPROVED");
  if (job.outputs.design) parts.push(`## DESIGN\n${job.outputs.design.message}`);
  if (job.posted) parts.push(`## POSTED\n${job.posted.platform} ${job.posted.url}\n${job.posted.metrics}`);
  if (job.outputs.analysis) parts.push(`## ANALYSIS\n${job.outputs.analysis.researchQuestions.join("; ")}`);
  parts.push(`Do your one job now as ${id.toUpperCase()}. JSON only.`);
  return parts.join("\n\n");
}

export function imaginePrompts(job: Job): { prompt: string; aspect: "9:16" | "1:1" }[] {
  const listed = job.outputs.design?.imaginePrompts.filter((p) => p && p.length > 20) || [];
  const topic = job.brief.topic;
  const fallback = [
    `Cinematic 9:16 social cover about: ${topic}. No text, no logo.`,
    `Minimal 1:1 thumbnail about: ${topic}. No text, no logo.`,
    `Editorial 9:16 still about: ${topic}. No text.`,
  ];
  return [
    { prompt: listed[0] || fallback[0], aspect: "9:16" },
    { prompt: listed[1] || fallback[1], aspect: "1:1" },
    { prompt: listed[2] || fallback[2], aspect: "9:16" },
  ];
}
