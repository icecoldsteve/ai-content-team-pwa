import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set([
  "grok-imagine-image-2.0",
  "grok-imagine-image",
  "grok-imagine-image-quality",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = req.headers.get("x-xai-key") || "";
    if (!key) {
      return NextResponse.json(
        { error: "Missing xAI API key. Add it in Keys." },
        { status: 401 }
      );
    }
    const requested = String(body.model || "grok-imagine-image-2.0");
    const model = ALLOWED.has(requested) ? requested : "grok-imagine-image-2.0";
    const prompt = String(body.prompt || "").slice(0, 2000);
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        aspect_ratio: body.aspect_ratio ?? "9:16",
        resolution: "1k",
        response_format: "b64_json",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Imagine upstream error" },
        { status: res.status }
      );
    }
    const images = (data.data || []).map(
      (d: { url?: string; b64_json?: string }) => ({
        url: d.url || (d.b64_json ? `data:image/jpeg;base64,${d.b64_json}` : ""),
        b64: d.b64_json,
      })
    );
    return NextResponse.json({ images });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Imagine request failed" },
      { status: 500 }
    );
  }
}
