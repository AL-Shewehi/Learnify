import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-primary">
        <BookOpen className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
        404 · Page not found
      </p>
      <h1 className="mt-3 max-w-lg font-display text-4xl leading-tight sm:text-5xl">
        This page took a wrong turn.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/courses">Browse courses</Link>
        </Button>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
        </Button>
      </div>
    </main>
  );
}
