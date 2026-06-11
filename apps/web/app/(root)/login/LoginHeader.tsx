"use client";

import { useSearchParams } from "next/navigation";

function LoginHeader() {
  const params = useSearchParams();
  const hasAuthError = params.has("error");

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
