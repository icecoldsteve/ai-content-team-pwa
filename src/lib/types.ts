export type EmployeeId =
  | "researcher"
  | "hook"
  | "script"
  | "designer"
  | "analyst"
  | "manager"
  | "publisher";

export type Platform =
  | "reels"
  | "tiktok"
  | "shorts"
  | "x"
  | "linkedin"
  | "reddit";

export type JobStatus =
  | "research"
  | "hook"
  | "script"
  | "design"
  | "publish"
  | "analyze"
  | "plan"
  | "done";

export interface Employee {
  id: EmployeeId;
  number: string;
  dept: string;
  title: string;
  tagline: string;
  color: string;
  colorSoft: string;
  capabilities: { icon: string; title: string; desc: string }[];
  delivers: string[];
  steps: { title: string; desc: string }[];
  engine: "claude" | "imagine" | "both";
}

export interface Brief {
  topic: string;
  audience: string;
  platforms: Platform[];
  voice: string;
  notes: string;
  metrics?: string;
}

export interface Source {
  id: string;
  title: string;
  url?: string;
  takeaway: string;
  origin: "wikipedia" | "hn" | "grok" | "user";
}

export interface Angle {
  id: string;
  title: string;
  rationale: string;
  format: string;
}

export interface HookOption {
  id: string;
  spoken: string;
  onScreen: string;
  why: string;
}

export interface ResearchOut {
  thesis: string;
  tensions: string[];
  sources: Source[];
  angles: Angle[];
  risks: string[];
  formats: Record<string, string>;
  raw: string;
}

export interface HooksOut {
  options: HookOption[];
  recommendedId: string;
  titles: string[];
  bodyMustDeliver: string;
  raw: string;
}

export interface ScriptOut {
  spoken: string;
  carousel: { slide: number; text: string }[];
  captions: Record<string, string>;
  hashtags: string[];
  raw: string;
}

export interface DesignOut {
  message: string;
  colors: string;
  slides: string[];
  imaginePrompts: string[];
  raw: string;
}

export interface AnalysisOut {
  observations: string[];
  interpretations: string[];
  hypotheses: string[];
  keep: string[];
  kill: string[];
  experiments: string[];
  researchQuestions: string[];
  raw: string;
}

export interface PlanOut {
  calendar: string;
  spinoffs: string[];
  checklist: string[];
  nextAction: string;
  raw: string;
}

export interface PublishOut {
  captions: Record<string, string>;
  firstComment: string;
  windows: string;
  checklist: string[];
  trackingFields: string[];
  raw: string;
}

export interface JobOutputs {
  gather?: Source[];
  research?: ResearchOut;
  hooks?: HooksOut;
  script?: ScriptOut;
  design?: DesignOut;
  images?: { url: string; prompt: string; b64?: string }[];
  analysis?: AnalysisOut;
  plan?: PlanOut;
  publish?: PublishOut;
}

export interface Gates {
  hook?: { winnerId: string; editedLine: string; approvedAt: string };
  script?: { approvedAt: string; notes: string };
  design?: { imageIndex: number; approvedAt: string };
}

export interface Posted {
  url: string;
  platform: string;
  at: string;
  metrics: string;
}

export interface Job {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  brief: Brief;
  outputs: JobOutputs;
  gates: Gates;
  posted?: Posted;
  logs: { at: string; employee: EmployeeId | "system"; message: string }[];
}

export interface BrandKit {
  voice: string;
  audience: string;
  pillars: string;
  banned: string;
  offer: string;
  proof: string;
}

export interface Learning {
  id: string;
  at: string;
  jobId: string;
  topic: string;
  experiments: string[];
  researchQuestions: string[];
  notes: string;
}

export interface PublishedItem {
  id: string;
  jobId: string;
  topic: string;
  url: string;
  platform: string;
  at: string;
  metrics: string;
}
