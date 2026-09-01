import { NextRequest, NextResponse } from "next/server";
import type { Source } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function wiki(topic: string): Promise<Source[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(topic)}&limit=5&namespace=0&format=json&origin=*`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = await res.json();
  const titles: string[] = data[1] || [];
  const descs: string[] = data[2] || [];
  const links: string[] = data[3] || [];
  return titles.map((title, i) => ({
    id: `wiki-${i + 1}`,
    title,
    url: links[i],
    takeaway: descs[i] || "Wikipedia match",
    origin: "wikipedia" as const,
  }));
}

async function hn(topic: string): Promise<Source[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(topic)}&hitsPerPage=5&tags=story`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.hits || []).map((h: { title?: string; url?: string; objectID: string; points?: number }, i: number) => ({
    id: `hn-${i + 1}`,
    title: h.title || "HN thread",
    url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
    takeaway: `${h.points ?? 0} points on Hacker News`,
    origin: "hn" as const,
  }));
}

async function grokBrief(topic: string, key: string, model: string): Promise<Source[]> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model || "grok-3",
      messages: [
        {
          role: "system",
          content:
            "Return JSON {items:[{title,takeaway}]} with 5 current, non-fabricated angles for a content brief. No URLs you cannot stand behind.",
        },
        { role: "user", content: `Topic: ${topic}` },
      ],
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return (parsed.items || []).slice(0, 5).map((item: { title: string; takeaway: string }, i: number) => ({
      id: `grok-${i + 1}`,
      title: item.title,
      takeaway: item.takeaway,
      origin: "grok" as const,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = String(body.topic || "").slice(0, 200);
    if (!topic) {
      return NextResponse.json({ error: "Missing topic" }, { status: 400 });
    }
    const key = req.headers.get("x-xai-key") || "";
    const [w, h, g] = await Promise.all([
      wiki(topic).catch(() => []),
      hn(topic).catch(() => []),
      key ? grokBrief(topic, key, body.model).catch(() => []) : Promise.resolve([]),
    ]);
    const sources = [...g, ...w, ...h].slice(0, 14);
    return NextResponse.json({ sources });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gather failed" },
      { status: 500 }
    );
  }
}
