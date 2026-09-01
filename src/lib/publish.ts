export function composerUrl(platform: string, text: string) {
  const cap = encodeURIComponent(text.slice(0, 280));
  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${cap}`;
    case "linkedin":
      return `https://www.linkedin.com/feed/?shareActive=true&text=${cap}`;
    case "tiktok":
      return "https://www.tiktok.com/upload";
    case "shorts":
      return "https://studio.youtube.com/";
    default:
      return "https://www.instagram.com/";
  }
}

export async function sendWebhook(url: string, payload: unknown) {
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ webhook: url, payload }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Webhook failed");
  return data;
}

export function packText(input: { topic: string; caption: string; firstComment?: string; platforms: string[] }) {
  return [`VOLTA PACK`, `Topic: ${input.topic}`, `Platforms: ${input.platforms.join(", ")}`, ``, `CAPTION`, input.caption, ``, `FIRST COMMENT`, input.firstComment || ""].join("\n");
}
