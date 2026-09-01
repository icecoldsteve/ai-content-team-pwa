import type { ApiKeys } from "./storage";
import type { Source } from "./types";

export async function runClaude(keys: ApiKeys, system: string, prompt: string) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-anthropic-key": keys.anthropic,
    },
    body: JSON.stringify({
      model: keys.claudeModel,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Claude failed");
  return String(data.text || "");
}

export async function runImagine(keys: ApiKeys, prompt: string, aspect: string) {
  const res = await fetch("/api/imagine", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-xai-key": keys.xai,
    },
    body: JSON.stringify({
      model: keys.imagineModel,
      prompt,
      aspect_ratio: aspect,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Imagine failed");
  return (data.images || []) as { url: string; b64?: string }[];
}

export async function runGather(keys: ApiKeys, topic: string): Promise<Source[]> {
  const res = await fetch("/api/gather", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-xai-key": keys.xai,
    },
    body: JSON.stringify({ topic, model: keys.grokModel }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gather failed");
  return (data.sources || []) as Source[];
}
