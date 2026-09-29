import { BadgeCheck, Clock3, ShieldCheck, Wallet } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Instructors",
    description: "Every instructor is reviewed before publishing their first course.",
  },
  {
    icon: Clock3,
    title: "Learn at Your Pace",
    description: "Lifetime access to your courses. Track progress as you go.",
  },
  {
    icon: BadgeCheck,
    title: "Completion Certificates",
    description: "Finish a course and get a certificate to showcase.",
  },
  {
    icon: Wallet,
    title: "Fair Pricing",
    description: "Transparent pricing with free courses available every week.",
  },
];

export function WhySection() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-center text-3xl font-bold">Why Learnify?</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}