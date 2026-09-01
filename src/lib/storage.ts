import type { BrandKit, Job, Learning, PublishedItem } from "./types";

const JOBS = "volta.jobs";
const KEYS = "volta.keys";
const BRAND = "volta.brand";
const LEARN = "volta.learnings";
const POSTED = "volta.published";

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
  audience: "",
  pillars: "",
  banned: "fake stats, empty urgency, generic guru talk",
  offer: "",
  proof: "",
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
  return { ...defaultKeys(), ...read(KEYS, defaultKeys()) };
}
export function saveKeys(keys: ApiKeys) {
  localStorage.setItem(KEYS, JSON.stringify(keys));
}
export function loadJobs(): Job[] {
  return readList<Job>(JOBS);
}
export function saveJobs(jobs: Job[]) {
  localStorage.setItem(JOBS, JSON.stringify(jobs));
}
export function loadBrand(): BrandKit {
  return { ...defaultBrand(), ...read(BRAND, defaultBrand()) };
}
export function saveBrand(brand: BrandKit) {
  localStorage.setItem(BRAND, JSON.stringify(brand));
}
export function loadLearnings(): Learning[] {
  return readList<Learning>(LEARN);
}
export function saveLearnings(items: Learning[]) {
  localStorage.setItem(LEARN, JSON.stringify(items.slice(0, 80)));
}
export function loadPublished(): PublishedItem[] {
  return readList<PublishedItem>(POSTED);
}
export function savePublished(items: PublishedItem[]) {
  localStorage.setItem(POSTED, JSON.stringify(items.slice(0, 80)));
}
