import { NextRequest, NextResponse } from "next/server";

type Store = Map<string, { blob: string; at: string }>;
const g = globalThis as typeof globalThis & { __voltaSync?: Store };
 if (!g.__voltaSync) g.__voltaSync = new Map();

export async function POST(req: NextRequest) {
  const { code, blob } = await req.json();
  const token = String(code || crypto.randomUUID().slice(0, 8)).toLowerCase();
  g.__voltaSync!.set(token, { blob: JSON.stringify(blob).slice(0, 900_000), at: new Date().toISOString() });
  return NextResponse.json({ code: token });
}

export async function GET(req: NextRequest) {
  const code = String(req.nextUrl.searchParams.get("code") || "").toLowerCase();
  const hit = g.__voltaSync!.get(code);
  if (!hit) return NextResponse.json({ error: "Unknown workspace code" }, { status: 404 });
  return NextResponse.json({ blob: JSON.parse(hit.blob), at: hit.at });
}
