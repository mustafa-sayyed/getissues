"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const handleSignInWithGithub = async () => {
    console.log("handleSignInWithGithub has been called");

    const data = await authClient.signIn.social({
      provider: "github",
      callbackURL: "http://localhost:3000/dashboard",
      errorCallbackURL: "http://localhost:3000/login",
    });

    console.log(data);
  };

  const params = useSearchParams();
  const error = params.get("error");
  console.log("Params:", params);

  if (error) {
    console.log("Sign in failed...");

    return (
      <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-background text-foreground">
        <div className="rounded-3xl border border-red-500 bg-red-50 p-8 shadow-[0_24px_60px_rgba(255,0,0,0.08)]">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">
            GitHub Sign-In Failed
          </h1>
          <p className="text-sm text-red-500/80 mb-6">
            <p>Error: {error}</p>
            We couldn&apos;t sign you in with GitHub. Please try again.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 text-base p-4 cursor-pointer"
            onClick={handleSignInWithGithub}
          >
            <FaGithub size={16} />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-xl items-center px-6">
        <div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl -mt-20 mb-10 text-center">
            Sign in to getissues
          </h1>
          <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_55%)]" />

          <div className="rounded-3xl border border-foreground/10  p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Continue with GitHub
              </h2>
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
                onClick={handleSignInWithGithub}
              >
                <FaGithub size={16} />
                Sign in with GitHub
              </Button>
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
