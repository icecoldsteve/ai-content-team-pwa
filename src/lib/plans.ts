export type PlanId = "free" | "byok" | "hosted" | "agency";

export const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  amountCents: number;
  blurb: string;
  points: string[];
}[] = [
  {
    id: "byok",
    name: "BYOK",
    price: "€39",
    amountCents: 3900,
    blurb: "Your keys. Your loop. Built for a solo operator.",
    points: ["Claude + Imagine via your keys", "1 workspace", "Human gates + memory", "Publish pack + webhook"],
  },
  {
    id: "hosted",
    name: "Hosted",
    price: "€99",
    amountCents: 9900,
    blurb: "We run the models. You run the crew.",
    points: ["Hosted Claude + Grok Imagine", "Cloud workspace sync", "No key wrangling", "Priority demo extras"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "€249",
    amountCents: 24900,
    blurb: "Seats for a UGC desk that ships every day.",
    points: ["5 seats", "Hosted models", "Client brand kits", "Webhook + schedule handoff"],
  },
];

export function planById(id: string) {
  return PLANS.find((p) => p.id === id);
}
