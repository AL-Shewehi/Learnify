"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`Rated ${value} out of 5`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            n <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted",
          )}
        />
      ))}
    </span>
  );
}
