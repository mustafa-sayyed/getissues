import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header Skeleton */}
      <Card className="border-border/60 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Skeleton className="size-30 rounded-full ring-3 ring-background" />
            <div className="flex-1 min-w-0 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="size-9 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Contributions Skeleton */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Skeleton className="size-4" />
            <Skeleton className="h-5 w-40" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                <Skeleton className="size-7 rounded-lg mt-0.5" />
                <div className="flex-1 space-y-2 mt-1">
                  <Skeleton className="h-4 w-full max-w-md" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
