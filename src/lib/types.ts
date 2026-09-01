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
  | "brief"
  | "research"
  | "hook"
  | "script"
  | "design"
  | "analyze"
  | "plan"
  | "publish"
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

export interface JobOutputs {
  research?: string;
  hooks?: string;
  script?: string;
  designBrief?: string;
  images?: { url: string; prompt: string }[];
  analysis?: string;
  plan?: string;
  publishPack?: string;
}

export interface Job {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: JobStatus;
  brief: Brief;
  outputs: JobOutputs;
  logs: { at: string; employee: EmployeeId | "system"; message: string }[];
}
