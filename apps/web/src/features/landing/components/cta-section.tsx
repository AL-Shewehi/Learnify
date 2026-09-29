import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="bg-foreground text-background">
      <div className="container mx-auto flex flex-col items-start gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:py-20">
        <div>
          <h2 className="max-w-md font-display text-3xl leading-tight sm:text-4xl">
            Know something worth teaching?
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-background/70">
            Publish a syllabus, keep your pricing, reach students who actually
            finish.
          </p>
        </div>
        <Button
          size="lg"
          variant="outline"
          asChild
          className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          <Link href="/signup">Apply as an instructor</Link>
        </Button>
      </div>
    </section>
  );
}
