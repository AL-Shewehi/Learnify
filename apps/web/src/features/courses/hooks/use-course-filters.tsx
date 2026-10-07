"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { COURSE_LEVELS, COURSE_SUBJECTS, COURSE_SORT_OPTIONS, type GetCoursesQuery } from "@learnify/shared";

const DEFAULTS: GetCoursesQuery = { page: 1, limit: 9, sort: "-createdAt" };

function parseFilters(searchParamsString: string): GetCoursesQuery {
  const sp = new URLSearchParams(searchParamsString);
  const rawPage = Number(sp.get("page"));
  const rawLimit = Number(sp.get("limit"));
  const rawLevel = sp.get("level");
  const rawSubject = sp.get("subject");
  const rawSort = sp.get("sort");
  const rawSearch = sp.get("search");

  return {
    page:
      Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 100
        ? rawPage
        : DEFAULTS.page,
    limit:
      Number.isInteger(rawLimit) && rawLimit >= 1 && rawLimit <= 100
        ? rawLimit
        : DEFAULTS.limit,
    level:
      rawLevel && (COURSE_LEVELS as readonly string[]).includes(rawLevel)
        ? (rawLevel as GetCoursesQuery["level"])
        : undefined,
    subject:
      rawSubject && (COURSE_SUBJECTS as readonly string[]).includes(rawSubject)
        ? (rawSubject as GetCoursesQuery["subject"])
        : undefined,
    sort:
      rawSort && (COURSE_SORT_OPTIONS as readonly string[]).includes(rawSort)
        ? (rawSort as GetCoursesQuery["sort"])
        : DEFAULTS.sort,
    search: rawSearch || undefined,
  };
}

export function useCourseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchParamsString = searchParams.toString();

  const filters = useMemo<GetCoursesQuery>(
    () => parseFilters(searchParamsString),
    [searchParamsString],
  );

  const setFilters = useCallback(
    (newFilters: Partial<GetCoursesQuery>) => {
      const base = parseFilters(searchParamsString);
      const updatedFilters = {
        ...base,
        ...newFilters,
        page: newFilters.page ?? 1,
      };
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(updatedFilters)) {
        if (value === undefined || value === "") continue;
        params.set(key, String(value));
      }
      const nextQueryString = params.toString();
      if (nextQueryString === searchParamsString) return;
      router.replace(
        nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
        { scroll: false },
      );
    },
    [searchParamsString, pathname, router],
  );

  return { filters, setFilters };
}
