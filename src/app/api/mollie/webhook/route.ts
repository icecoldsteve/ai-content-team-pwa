import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  console.log("mollie webhook", body.slice(0, 400));
  return NextResponse.json({ ok: true });
}
