import { Suspense } from "react";
import { AuthGate } from "@/components/AuthGate";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="auth">Loading…</p>}>
      <AuthGate />
    </Suspense>
  );
}
