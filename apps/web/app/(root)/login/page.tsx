"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import LoginHeader from "./LoginHeader";

export default function LoginPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

  const handleSignInWithGithub = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setSignInError(null);

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: `${baseUrl}/dashboard?success=true`,
        errorCallbackURL: `${baseUrl}/login`,
      });
    } catch {
      setSignInError("We could not start GitHub sign-in. Please try again.");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-xl items-center px-6">
        <div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl -mt-20 mb-10 text-center">
            Sign in to getissues
          </h1>
          <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.12),transparent_55%)]" />

          <div className="rounded-3xl border border-foreground/10  p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="space-y-3">
              <Suspense
                fallback={
                  <h2 className="text-2xl font-semibold text-foreground">
                    Continue with GitHub
                  </h2>
                }
              >
                <LoginHeader />
              </Suspense>
              <p className="text-sm text-foreground/60">
                Sign in with your GitHub account to let our AI agents find the
                best issues for you based on your skills and interests.
              </p>
            </div>
            <div className="mt-8">
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 text-base p-4 cursor-pointer"
                disabled={isSigningIn}
                aria-busy={isSigningIn}
                onClick={handleSignInWithGithub}
              >
                {isSigningIn ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FaGithub size={16} />
                )}
                {isSigningIn
                  ? "Signing in with GitHub..."
                  : "Sign in with GitHub"}
              </Button>
              <p className="mt-3 text-center text-xs text-foreground/50">
                You will be redirected to GitHub to approve access.
              </p>
              {signInError ? (
                <p className="mt-3 text-center text-sm text-destructive">
                  {signInError}
                </p>
              ) : null}
            </div>
            <p className="mt-6 text-sm text-foreground/50">
              By continuing you agree to our{" "}
              <Link
                className="underline underline-offset-1 hover:text-foreground"
                href={"/terms"}
              >
                Terms
              </Link>{" "}
              and acknowledge the{" "}
              <Link
                className="underline underline-offset-1 hover:text-foreground"
                href={"/privacy-policy"}
              >
                Privacy Policy.
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
