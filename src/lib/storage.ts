import type { Job } from "./types";

const JOBS = "act.jobs";
const KEYS = "act.keys";

export interface ApiKeys {
  anthropic: string;
  xai: string;
  claudeModel: string;
  imagineModel: string;
}

export const defaultKeys = (): ApiKeys => ({
  anthropic: "",
  xai: "",
  claudeModel: "claude-sonnet-4-5",
  imagineModel: "grok-imagine-image-2.0",
});

export function loadKeys(): ApiKeys {
  if (typeof window === "undefined") return defaultKeys();
  try {
    return { ...defaultKeys(), ...JSON.parse(localStorage.getItem(KEYS) || "{}") };
  } catch {
    return defaultKeys();
  }
}

export function saveKeys(keys: ApiKeys) {
  localStorage.setItem(KEYS, JSON.stringify(keys));
}

export function loadJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(JOBS) || "[]");
  } catch {
    return [];
  }
}

export function saveJobs(jobs: Job[]) {
  localStorage.setItem(JOBS, JSON.stringify(jobs));
}
