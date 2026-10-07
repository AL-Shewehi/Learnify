import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CourseResponse } from "@learnify/shared";

export const COVER_PALETTES = [
  { bg: "#1e5c4f", fg: "#f2f1ea", accent: "#a9c8bc" }, // pine
  { bg: "#b3502a", fg: "#f6f1ea", accent: "#e8bfa8" }, // clay
  { bg: "#2e4a68", fg: "#eef1f4", accent: "#b3c4d6" }, // slate
  { bg: "#7a6118", fg: "#f6f3e9", accent: "#dcc98f" }, // ochre
  { bg: "#54493f", fg: "#f3f0eb", accent: "#cec4b2" }, // bark
] as const;

export function paletteFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return COVER_PALETTES[Math.abs(h) % COVER_PALETTES.length];
}

export function CourseCover({
  course,
  className,
  priority = false,
}: {
  course: CourseResponse;
  className?: string;
  priority?: boolean;
}) {
  if (course.coverImage) {
  return (
    <Image
      src={course.coverImage}
      alt={course.title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        className,
      )}
    />
  );
}

  const p = paletteFor(course.subject ?? course.title);

  return (
    <div
      className={cn("relative flex h-full w-full flex-col justify-between overflow-hidden p-4", className)}
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `repeating-linear-gradient(-45deg, ${p.fg} 0 1px, transparent 1px 8px)`,
        }}
      />
      <span
        className="relative font-mono text-[10px] uppercase tracking-[0.2em]"
        style={{ color: p.accent }}
      >
        {course.subject ?? "General"}
      </span>
      <span className="relative line-clamp-2 font-display text-2xl leading-tight">
        {course.title}
      </span>
    </div>
  );
}