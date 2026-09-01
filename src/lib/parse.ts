import { extractJson, lines } from "./json";
import type {
  AnalysisOut,
  DesignOut,
  HooksOut,
  PlanOut,
  PublishOut,
  ResearchOut,
  ScriptOut,
  Source,
} from "./types";

export function parseResearch(raw: string, gathered: Source[]): ResearchOut {
  const data = extractJson<Partial<ResearchOut>>(raw);
  return {
    thesis: data?.thesis || raw.slice(0, 400),
    tensions: lines(data?.tensions),
    sources: (data?.sources as Source[])?.length ? (data!.sources as Source[]) : gathered,
    angles: Array.isArray(data?.angles)
      ? data!.angles.map((a, i) => ({
          id: a.id || `a${i + 1}`,
          title: a.title || "Untitled angle",
          rationale: a.rationale || "",
          format: a.format || "reel",
        }))
      : [],
    risks: lines(data?.risks),
    formats: data?.formats || {},
    raw,
  };
}

export function parseHooks(raw: string): HooksOut {
  const data = extractJson<Partial<HooksOut>>(raw);
  const options = Array.isArray(data?.options)
    ? data!.options.map((o, i) => ({
        id: o.id || `h${i + 1}`,
        spoken: o.spoken || "",
        onScreen: o.onScreen || o.spoken || "",
        why: o.why || "",
      }))
    : [];
  return {
    options,
    recommendedId: data?.recommendedId || options[0]?.id || "h1",
    titles: lines(data?.titles),
    bodyMustDeliver: data?.bodyMustDeliver || "",
    raw,
  };
}

export function parseScript(raw: string): ScriptOut {
  const data = extractJson<Partial<ScriptOut>>(raw);
  return {
    spoken: data?.spoken || raw,
    carousel: Array.isArray(data?.carousel) ? data!.carousel : [],
    captions: data?.captions || {},
    hashtags: lines(data?.hashtags),
    raw,
  };
}

export function parseDesign(raw: string): DesignOut {
  const data = extractJson<Partial<DesignOut>>(raw);
  return {
    message: data?.message || "",
    colors: data?.colors || "",
    slides: lines(data?.slides),
    imaginePrompts: lines(data?.imaginePrompts),
    raw,
  };
}

export function parseAnalysis(raw: string): AnalysisOut {
  const data = extractJson<Partial<AnalysisOut>>(raw);
  return {
    observations: lines(data?.observations),
    interpretations: lines(data?.interpretations),
    hypotheses: lines(data?.hypotheses),
    keep: lines(data?.keep),
    kill: lines(data?.kill),
    experiments: lines(data?.experiments),
    researchQuestions: lines(data?.researchQuestions),
    raw,
  };
}

export function parsePlan(raw: string): PlanOut {
  const data = extractJson<Partial<PlanOut>>(raw);
  return {
    calendar: data?.calendar || raw,
    spinoffs: lines(data?.spinoffs),
    checklist: lines(data?.checklist),
    nextAction: data?.nextAction || "",
    raw,
  };
}

export function parsePublish(raw: string): PublishOut {
  const data = extractJson<Partial<PublishOut>>(raw);
  return {
    captions: data?.captions || {},
    firstComment: data?.firstComment || "",
    windows: data?.windows || "",
    checklist: lines(data?.checklist),
    trackingFields: lines(data?.trackingFields),
    raw,
  };
}
