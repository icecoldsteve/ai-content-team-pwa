import type { EmployeeId, Gates, Job, JobOutputs, JobStatus } from "./types";

export const MAKE_ORDER: EmployeeId[] = [
  "researcher",
  "hook",
  "script",
  "designer",
  "publisher",
];

export const LEARN_ORDER: EmployeeId[] = ["analyst", "manager"];

export const NEXT_STATUS: Record<EmployeeId, JobStatus> = {
  researcher: "hook",
  hook: "script",
  script: "design",
  designer: "publish",
  publisher: "analyze",
  analyst: "plan",
  manager: "done",
};

export function roleBlocked(job: Job, id: EmployeeId): string | null {
  const o = job.outputs;
  const g = job.gates;
  switch (id) {
    case "researcher":
      return null;
    case "hook":
      return o.research ? null : "Researcher must deliver first.";
    case "script":
      if (!o.hooks) return "Hook Writer must deliver first.";
      if (!g.hook) return "Approve a winning hook before Script.";
      return null;
    case "designer":
      if (!o.script) return "Script Writer must deliver first.";
      if (!g.script) return "Approve the script before Design.";
      return null;
    case "publisher":
      if (!o.design) return "Designer must deliver first.";
      if (!g.design) return "Approve a visual before Publish.";
      return null;
    case "analyst":
      if (!o.publish && !job.posted && !job.brief.metrics) {
        return "Publish first, or paste live metrics into the brief.";
      }
      return null;
    case "manager":
      return o.analysis || o.publish
        ? null
        : "Analyst or Publisher must deliver first.";
    default:
      return "Unknown role.";
  }
}

export function applyRoleOutput(
  job: Job,
  id: EmployeeId,
  patch: Partial<JobOutputs>
): Job {
  return {
    ...job,
    outputs: { ...job.outputs, ...patch },
    status: NEXT_STATUS[id],
    updatedAt: new Date().toISOString(),
    logs: [
      ...job.logs,
      {
        at: new Date().toISOString(),
        employee: id,
        message: `${id} delivered.`,
      },
    ],
  };
}

export function approveHook(
  job: Job,
  winnerId: string,
  editedLine: string
): Job {
  const gates: Gates = {
    ...job.gates,
    hook: { winnerId, editedLine, approvedAt: new Date().toISOString() },
  };
  return { ...job, gates, updatedAt: new Date().toISOString(), status: "script" };
}

export function approveScript(job: Job, notes: string): Job {
  return {
    ...job,
    gates: {
      ...job.gates,
      script: { approvedAt: new Date().toISOString(), notes },
    },
    updatedAt: new Date().toISOString(),
    status: "design",
  };
}

export function approveDesign(job: Job, imageIndex: number): Job {
  return {
    ...job,
    gates: {
      ...job.gates,
      design: { imageIndex, approvedAt: new Date().toISOString() },
    },
    updatedAt: new Date().toISOString(),
    status: "publish",
  };
}
