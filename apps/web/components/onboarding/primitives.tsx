/** Shared onboarding typography — one scale, every step. */
export function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium text-muted-foreground">{children}</p>
  );
}

export function StepLede({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
