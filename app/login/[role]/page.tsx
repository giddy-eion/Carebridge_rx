"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

const ROLE_HOME: Record<string, string> = {
  clinician: "/dashboard",
  caregiver: "/caregiver",
  patient: "/patient",
};

const ROLE_LABEL: Record<string, string> = {
  clinician: "Clinician",
  caregiver: "Caregiver",
  patient: "Patient",
};

export default function LoginPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = use(params);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const isValidRole = role === "clinician" || role === "caregiver" || role === "patient";

  function handleSignIn() {
    if (!isValidRole) return;
    login(role as "clinician" | "caregiver" | "patient");
    router.replace(ROLE_HOME[role]);
  }

  if (!isValidRole) {
    return <main className="p-8 text-sm text-foreground-muted">Unknown role.</main>;
  }

  return (
    <main className="min-h-screen bg-surface flex flex-col px-6 py-6">
      <button
        onClick={() => router.push("/")}
        className="w-8 h-8 rounded-full bg-surface-raised shadow-[0_2px_6px_rgba(16,22,43,0.08)] flex items-center justify-center mb-8"
        aria-label="Back to role selection"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <p className="text-xs text-foreground-muted mb-1">Sign in as</p>
        <h1 className="font-display font-semibold text-2xl text-foreground mb-8">{ROLE_LABEL[role]}</h1>

        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-xs text-foreground-muted mb-1 block">
              Email
            </label>
            <input
              id="email"
              type="text"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm outline-none focus-visible:border-brand-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs text-foreground-muted mb-1 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface-raised px-4 py-2.5 text-sm outline-none focus-visible:border-brand-500"
            />
          </div>
          <Button size="lg" className="mt-2 w-full" onClick={handleSignIn}>
            Sign in
          </Button>
          <p className="text-[11px] text-foreground-muted text-center mt-1">
            Demo mode — any email and password will work.
          </p>
        </div>
      </div>
    </main>
  );
}
