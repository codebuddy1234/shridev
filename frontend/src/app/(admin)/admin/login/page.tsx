import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/states";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-5 py-16">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10"
        style={{
          maskImage: "radial-gradient(50% 50% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(50% 50% at 50% 40%, black, transparent)",
        }}
      />

      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo href={null} markSize={34} />
        </div>

        <h1 className="mt-8 text-center font-display text-2xl font-semibold text-ink">
          Admin sign in
        </h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Internal dashboard for enquiries and site content.
        </p>

        <Suspense fallback={<Skeleton className="mt-10 h-64 w-full rounded-panel" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
