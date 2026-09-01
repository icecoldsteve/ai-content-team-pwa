import type { BrandKit, Job, Learning, PublishedItem } from "./types";
import { loadSession, ns } from "./session";

function k(name: string) {
  return ns(loadSession()?.userId, name);
}

export interface ApiKeys {
  anthropic: string;
  xai: string;
  claudeModel: string;
  imagineModel: string;
  grokModel: string;
}

export const defaultKeys = (): ApiKeys => ({
  anthropic: "",
  xai: "",
  claudeModel: "claude-sonnet-4-5",
  imagineModel: "grok-imagine-image-2.0",
  grokModel: "grok-3",
});

export const defaultBrand = (): BrandKit => ({
  voice: "direct, specific, proof-led, no fluff",
  audience: "UGC agency producers and solo coaches who ship short-form daily",
  pillars: "first sentence before moodboard; 10 hooks before one script; mute-test every cut",
  banned: "fake stats, empty urgency, generic guru talk, logo in frame one",
  offer: "Done-with-you short-form system for UGC desks",
  proof: "Demo case: 41% 3-second retention on the 3/40 film",
});

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export function loadKeys(): ApiKeys {
  return { ...defaultKeys(), ...read(k("keys"), defaultKeys()) };
}
export function saveKeys(keys: ApiKeys) {
  localStorage.setItem(k("keys"), JSON.stringify(keys));
}
export function loadJobs(): Job[] {
  return readList<Job>(k("jobs"));
}
export function saveJobs(jobs: Job[]) {
  localStorage.setItem(k("jobs"), JSON.stringify(jobs));
}
export function loadBrand(): BrandKit {
  return { ...defaultBrand(), ...read(k("brand"), defaultBrand()) };
}
export function saveBrand(brand: BrandKit) {
  localStorage.setItem(k("brand"), JSON.stringify(brand));
}
export function loadLearnings(): Learning[] {
  return readList<Learning>(k("learnings"));
}
export function saveLearnings(items: Learning[]) {
  localStorage.setItem(k("learnings"), JSON.stringify(items.slice(0, 80)));
}
export function loadPublished(): PublishedItem[] {
  return readList<PublishedItem>(k("published"));
}
export function savePublished(items: PublishedItem[]) {
  localStorage.setItem(k("published"), JSON.stringify(items.slice(0, 80)));
}
