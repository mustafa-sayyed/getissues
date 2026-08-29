import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Icon from "@/components/dashboard/sidebar/Icon";
import { OnboardingForm } from "@/components/dashboard/OnboardingForm";

export default function OnboardingPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-12 text-foreground sm:py-20">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center">
        <Card className="w-full border-border/60 shadow-sm">
          <CardHeader className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome to GetIssues! 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell us a bit about yourself so our AI agent can recommend the
              perfect open-source issues for you to tackle.
            </p>
          </CardHeader>
          <CardContent>
            <OnboardingForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
