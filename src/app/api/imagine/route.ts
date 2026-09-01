import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const key = req.headers.get("x-xai-key") || process.env.XAI_API_KEY || "";
    if (!key) {
      return NextResponse.json(
        { error: "Missing xAI API key. Add it in Settings." },
        { status: 401 }
      );
    }

    const model =
      body.model || process.env.IMAGINE_MODEL || "grok-imagine-image-2.0";

    const res = await fetch("https://api.x.ai/v1/images/generations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        prompt: body.prompt,
        n: body.n ?? 1,
        aspect_ratio: body.aspect_ratio ?? "9:16",
        resolution: body.resolution ?? "1k",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message || JSON.stringify(data) },
        { status: res.status }
      );
    }

    const images = (data.data || []).map(
      (d: { url?: string; b64_json?: string }) => ({
        url: d.url || (d.b64_json ? `data:image/jpeg;base64,${d.b64_json}` : ""),
      })
    );

    return NextResponse.json({ images, raw: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Imagine request failed" },
      { status: 500 }
    );
  }
}
