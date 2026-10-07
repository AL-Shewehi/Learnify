"use client";

import { Stars } from "./stars";

export function RatingSummary({
  average,
  count,
}: {
  average: number;
  count: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-card p-6">
      <p className="font-display text-5xl">{average.toFixed(1)}</p>
      <div>
        <Stars value={average} />
        <p className="mt-1 text-sm text-muted-foreground">
          {count === 0
            ? "No reviews yet"
            : `${count} review${count === 1 ? "" : "s"}`}
        </p>
      </div>
    </div>
  );
}
