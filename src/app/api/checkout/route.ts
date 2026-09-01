import { NextRequest, NextResponse } from "next/server";
import { planById } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { plan } = await req.json().catch(() => ({ plan: "byok" }));
  const spec = planById(String(plan));
  if (!spec) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const key = process.env.MOLLIE_API_KEY || "";
  const origin = req.headers.get("origin") || process.env.VOLTA_URL || "https://volta-smsak.vercel.app";
  if (!key) {
    return NextResponse.json({ url: `${origin}/login?plan=${spec.id}&checkout=local` });
  }
  const res = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      amount: { currency: "EUR", value: (spec.amountCents / 100).toFixed(2) },
      description: `Volta ${spec.name} monthly`,
      redirectUrl: `${origin}/login?plan=${spec.id}&paid=1`,
      webhookUrl: `${origin}/api/mollie/webhook`,
      metadata: { plan: spec.id },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data.detail || "Mollie failed", url: `${origin}/login?plan=${spec.id}` }, { status: 502 });
  }
  return NextResponse.json({ url: data._links?.checkout?.href, id: data.id });
}
