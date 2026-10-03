import { headers } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { ProfileLoader } from "@/app/onboarding/profile-loader";
import { FetchingState } from "@/components/onboarding/fetching-state";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {

  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? "";

  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: requestHeaders,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fast gate — stays in the parent so redirects happen before streaming.
  // NB: redirect() must be called outside try/catch — thrown redirects
  // would otherwise be swallowed by the catch block.
  if (apiUrl) {
    let skillsStatus: number | null = null;
    try {
      const res = await axios.get(`${apiUrl}/users/skills`, {
        headers: { cookie },
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      });
      skillsStatus = res.status;
    } catch {
      // If skills check fails, stay on onboarding — wizard will surface errors.
    }
    if (skillsStatus !== null && skillsStatus !== 404) {
      redirect("/dashboard");
    }
  }

  const userName = session.user.name ?? "contributor";
  const userImage = (session.user.image as string | null) ?? "";

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-background text-foreground">
      {/* Ambient spotlights */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(var(--spotlight-emerald),.16),transparent_45%),radial-gradient(circle_at_88%_18%,rgba(var(--spotlight-amber),.12),transparent_42%),radial-gradient(circle_at_55%_90%,rgba(var(--spotlight-sky),.13),transparent_40%)]" />

      {/* Top bar */}
      <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-10 sm:pt-14">
        {/* Slow GitHub aggregation streams in — shell + theater show first. */}
        <Suspense fallback={<FetchingState userName={userName} />}>
          <ProfileLoader
            cookie={cookie}
            userName={userName}
            userImage={userImage}
          />
        </Suspense>
      </div>
    </main>
  );
}
