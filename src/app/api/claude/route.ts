import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = new Set([
  "claude-sonnet-4-5",
  "claude-sonnet-4-20250514",
  "claude-opus-4-5",
  "claude-opus-4-1",
  "claude-3-5-sonnet-latest",
  "claude-3-7-sonnet-latest",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = req.headers.get("x-anthropic-key") || "";
    if (!key) {
      return NextResponse.json(
        { error: "Missing Anthropic API key. Add it in Keys." },
        { status: 401 }
      );
    }
    const requested = String(body.model || "claude-sonnet-4-5");
    const model = ALLOWED.has(requested) ? requested : "claude-sonnet-4-5";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: Math.min(Number(body.max_tokens) || 4096, 8192),
        system: body.system,
        messages: body.messages ?? [{ role: "user", content: body.prompt }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Claude upstream error" },
        { status: res.status }
      );
    }
    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Claude request failed" },
      { status: 500 }
    );
  }
}
