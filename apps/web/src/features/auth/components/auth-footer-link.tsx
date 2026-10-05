import Link from "next/link";

interface AuthFooterLinkProps {
  question: string;
  href: string;
  label: string;
}

export function AuthFooterLink({ question, href, label }: AuthFooterLinkProps) {
  return (
    <div className="mt-9 border-t border-border pt-6 text-center text-sm leading-6 text-muted-foreground">
      {question}{" "}
      <Link
        href={href}
        className="font-semibold text-primary underline-offset-4 hover:underline"
      >
        {label}
      </Link>
    </div>
  );
}