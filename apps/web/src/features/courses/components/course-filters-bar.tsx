"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { COURSE_LEVELS, COURSE_SUBJECTS, type GetCoursesQuery } from "@learnify/shared";
import { Input } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

interface CourseFiltersBarProps {
  filters: GetCoursesQuery;
  onChange: (newFilters: Partial<GetCoursesQuery>) => void;
}

const SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest" },
  { value: "-totalStudents", label: "Most enrolled" },
  { value: "-rating", label: "Highest rated" },
  { value: "price", label: "Price: low → high" },
  { value: "-price", label: "Price: high → low" },
] as const;

export function CourseFiltersBar({ filters, onChange }: CourseFiltersBarProps) {
  const [search, setSearch] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if ((filters.search ?? "") !== debouncedSearch) {
      onChange({ search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center">
      {/* Search */}
      <div className="relative md:max-w-xs md:flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the catalog…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 md:ml-auto">
        {/* Subject */}
        <Select
          value={filters.subject ?? "__all"}
          onValueChange={(v) =>
            onChange({ subject: v === "__all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All subjects</SelectItem>
            {COURSE_SUBJECTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level */}
        <Select
          value={filters.level ?? "__all"}
          onValueChange={(v) =>
            onChange({
              level:
                v === "__all"
                  ? undefined
                  : (v as NonNullable<GetCoursesQuery["level"]>),
            })
          }
        >
          <SelectTrigger className="w-40"> 
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All levels</SelectItem>
            {COURSE_LEVELS.map((l) => (
              <SelectItem key={l} value={l} className="capitalize">
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(v) => onChange({ sort: v })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}