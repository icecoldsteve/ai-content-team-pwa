import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key =
      req.headers.get("x-anthropic-key") || process.env.ANTHROPIC_API_KEY || "";
    if (!key) {
      return NextResponse.json(
        { error: "Missing Anthropic API key. Add it in Settings." },
        { status: 401 }
      );
    }

    const model = body.model || process.env.CLAUDE_MODEL || "claude-sonnet-4-5";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: body.max_tokens ?? 4096,
        system: body.system,
        messages: body.messages ?? [{ role: "user", content: body.prompt }],
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || JSON.stringify(data) },
        { status: res.status }
      );
    }

    const text = (data.content || [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n");

    return NextResponse.json({ text, raw: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Claude request failed" },
      { status: 500 }
    );
  }
}
