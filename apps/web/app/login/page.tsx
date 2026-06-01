import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-5xl items-center px-6">
        <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden md:flex flex-col justify-center gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Sign in to getissues
              </h1>
              <p className="max-w-xl text-base text-foreground/70">
                Authenticate with GitHub to get personalized issues, searched on
                behalf of you by AI Agents.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-foreground/70">
              <span className="rounded-full border border-foreground/70 px-3 py-1">
                Minimal setup
              </span>
              <span className="rounded-full border border-foreground/70 px-3 py-1">
                Private by default
              </span>
              <span className="rounded-full border border-foreground/70 px-3 py-1">
                Real-time status
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_55%)]" />
            <div className="rounded-3xl border border-foreground/10  p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-foreground">
                  Continue with GitHub
                </h2>
                <p className="text-sm text-foreground/60">
                  Sign in with your GitHub account to let our AI agents find the best issues for you based on your skills and interests.
                </p>
              </div>
              <div className="mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 text-base p-4 cursor-pointer"
                >
                  <FaGithub size={16} />
                  Sign in with GitHub
                </Button>
              </div>
              <p className="mt-6 text-sm text-foreground/50">
                By continuing you agree to our <Link className="underline underline-offset-1 hover:text-foreground" href={"/terms"}>Terms</Link> and acknowledge the <Link className="underline underline-offset-1 hover:text-foreground" href={"/privacy-policy"}>Privacy
                Policy.</Link> 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
