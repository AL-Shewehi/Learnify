interface AuthIntroProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function AuthIntro({ eyebrow, title, subtitle }: AuthIntroProps) {
  return (
    <div className="mb-9">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}