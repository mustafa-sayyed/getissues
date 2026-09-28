"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/formatters";

export function NextRunCountdown({
  nextRunAt,
}: {
  nextRunAt: string | null;
}) {
  // Ticking clock for the "Next Agent Run" countdown. Only ticks while a
  // future run is scheduled so the page doesn't re-render every second
  // for no reason.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!nextRunAt) return;
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [nextRunAt]);

  return <>{formatCountdown(nextRunAt, now)}</>;
}
