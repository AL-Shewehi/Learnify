"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-destructive">
        Something went wrong
      </p>
      <h1 className="mt-3 max-w-lg font-display text-4xl leading-tight sm:text-5xl">
        We could not load this page.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
        Try loading the page again. If the problem continues, return to the
        catalog and choose another page.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Button onClick={reset} className="w-full sm:w-auto">
          <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>
    </main>
  );
}
