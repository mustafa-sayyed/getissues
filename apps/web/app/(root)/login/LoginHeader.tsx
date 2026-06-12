"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function LoginHeader() {
  const params = useSearchParams();
  const hasAuthError = params.has("error");
  const isSuccess = params.get("success") === "true";
  const router = useRouter();

  useEffect(() => {
    if (isSuccess) {
      router.replace("/dashboard");
    }
  });

  return hasAuthError ? (
    <h2 className="text-2xl font-semibold text-destructive">
      Error while signing in with GitHub. Please try again.
    </h2>
  ) : isSuccess ? (
    <h2 className="text-2xl font-semibold text-primary">
      Authentication successful! Redirecting to dashboard...
    </h2>
  ) : (
    <h2 className="text-2xl font-semibold text-foreground">
      Continue with GitHub
    </h2>
  );
}

export default LoginHeader;
