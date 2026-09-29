import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: "text-lg gap-1.5",
    default: "text-xl gap-2",
    lg: "text-2xl gap-2",
  };

  const iconSizes = {
    sm: 20,
    default: 24,
    lg: 28,
  };

  return (
    <Link href="/" className={cn("flex items-center font-bold", sizes[size])}>
      <GraduationCap
        size={iconSizes[size]}
        className="text-primary"
        strokeWidth={2.5}
      />
      <span className="font-display text-xl font-semibold tracking-tight">
        Learnify
      </span>
    </Link>
  );
}
