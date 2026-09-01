import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { webhook, payload } = await req.json();
  const url = String(webhook || "");
  if (!/^https:\/\//i.test(url)) {
    return NextResponse.json({ error: "Webhook must be https" }, { status: 400 });
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-volta-adapter": "publish" },
    body: JSON.stringify({ source: "volta", sentAt: new Date().toISOString(), payload }),
  });
  if (!res.ok) return NextResponse.json({ error: `Adapter ${res.status}` }, { status: 502 });
  return NextResponse.json({ ok: true });
}
