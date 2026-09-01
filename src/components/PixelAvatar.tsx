"use client";

import type { EmployeeId } from "@/lib/types";

const PALETTES: Record<EmployeeId, string> = {
  researcher: "#3B6FF5",
  hook: "#C4784A",
  script: "#C9A227",
  designer: "#6B5CFF",
  analyst: "#2F9E6A",
  manager: "#B85C4A",
  publisher: "#3A7D8C",
};

export function PixelAvatar({ id, size = 72 }: { id: EmployeeId; size?: number }) {
  const c = PALETTES[id];
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden>
      <rect width="12" height="12" fill="transparent" />
      {id === "researcher" && (
        <>
          <rect x="3" y="2" width="6" height="2" fill={c} />
          <rect x="2" y="4" width="8" height="4" fill={c} />
          <rect x="2" y="8" width="3" height="2" fill={c} />
          <rect x="7" y="8" width="3" height="2" fill={c} />
          <rect x="4" y="5" width="1" height="1" fill="#0b1b3a" />
          <rect x="7" y="5" width="1" height="1" fill="#0b1b3a" />
        </>
      )}
      {id === "hook" && (
        <>
          <rect x="3" y="2" width="6" height="7" fill={c} />
          <rect x="2" y="4" width="1" height="3" fill={c} />
          <rect x="9" y="4" width="1" height="3" fill={c} />
          <rect x="4" y="4" width="1" height="1" fill="#2a1408" />
          <rect x="7" y="4" width="1" height="1" fill="#2a1408" />
        </>
      )}
      {id === "script" && (
        <>
          <rect x="2" y="3" width="8" height="6" fill={c} />
          <rect x="3" y="2" width="6" height="1" fill={c} />
          <rect x="4" y="5" width="1" height="1" fill="#2a2204" />
          <rect x="7" y="5" width="1" height="1" fill="#2a2204" />
        </>
      )}
      {id === "designer" && (
        <>
          <rect x="3" y="2" width="6" height="2" fill={c} />
          <rect x="2" y="4" width="8" height="5" fill={c} />
          <rect x="4" y="5" width="1" height="1" fill="#1a1038" />
          <rect x="7" y="5" width="1" height="1" fill="#1a1038" />
        </>
      )}
      {id === "analyst" && (
        <>
          <rect x="3" y="2" width="6" height="7" fill={c} />
          <rect x="4" y="4" width="1" height="2" fill="#062416" />
          <rect x="7" y="4" width="1" height="2" fill="#062416" />
        </>
      )}
      {id === "manager" && (
        <>
          <rect x="3" y="2" width="6" height="7" fill={c} />
          <rect x="4" y="4" width="1" height="1" fill="#2a100c" />
          <rect x="7" y="4" width="1" height="1" fill="#2a100c" />
        </>
      )}
      {id === "publisher" && (
        <>
          <rect x="3" y="2" width="6" height="2" fill={c} />
          <rect x="2" y="4" width="8" height="5" fill={c} />
          <rect x="4" y="5" width="1" height="1" fill="#04181c" />
          <rect x="7" y="5" width="1" height="1" fill="#04181c" />
        </>
      )}
    </svg>
  );
}
