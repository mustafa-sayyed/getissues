"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function LoginHeader() {
  const params = useSearchParams();
  const hasAuthError = params.has("error");
  const isSuccess = params.get("success") === "true";
  const isDeleted = params.get("deleted") === "true";
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // Only leave /login?success=true once the session is confirmed.
    // Hard navigation ensures the fresh cross-subdomain cookie is sent
    // on the first dashboard request.
    if (isSuccess && !hasAuthError && !isPending && session?.user) {
      window.location.href = "/dashboard";
    }
  }, [isSuccess, hasAuthError, isPending, session]);

  useEffect(() => {
    // Show confirmation when redirected after account deletion, then clear the flag.
    if (isDeleted) {
      toast.success("Your account has been deleted.");
      router.replace("/login");
    }
  }, [isDeleted, router]);

  // Show the success state while the session is settling or confirmed.
  if (isSuccess && !hasAuthError && (isPending || session?.user)) {
    return (
      <h2 className="text-2xl font-semibold text-primary">
        Authentication successful! Redirecting to dashboard...
      </h2>
    );
  }

  return hasAuthError ? (
    <h2 className="text-2xl font-semibold text-destructive">
      Error while signing in with GitHub. Please try again.
    </h2>
  ) : (
    <h2 className="text-2xl font-semibold text-foreground">
      Continue with GitHub
    </h2>
  );
}

export default LoginHeader;
