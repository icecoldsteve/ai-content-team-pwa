"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, register } from "@/lib/session";
import type { PlanId } from "@/lib/plans";

export function AuthGate() {
  const router = useRouter();
  const params = useSearchParams();
  const plan = (params.get("plan") as PlanId) || "byok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    try {
      if (mode === "signup") await register(email, password, plan === "free" ? "byok" : plan);
      else await login(email, password);
      router.push("/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed");
    }
  }

  return (
    <div className="auth">
      <h1>{mode === "signup" ? "Open a workspace" : "Return to the desk"}</h1>
      <p>Plan attached: {plan.toUpperCase()}.</p>
      {error && <p className="banner">{error}</p>}
      <label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button className="primary" onClick={submit}>{mode === "signup" ? "Create workspace" : "Log in"}</button>
      <button className="ghost" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
        {mode === "signup" ? "I already have a desk" : "Create a desk"}
      </button>
    </div>
  );
}
