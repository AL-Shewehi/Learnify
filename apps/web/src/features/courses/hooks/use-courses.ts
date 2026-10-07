"use client";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { GetCoursesQuery } from "@learnify/shared";
import { coursesApi } from "../api/courses-api";
import { qk } from "@/lib/query-keys";

export function useCourses(params?: Partial<GetCoursesQuery>) {
  const key = {
    page: params?.page ?? 1,
    limit: params?.limit ?? 9,
    subject: params?.subject,
    level: params?.level,
    sort: params?.sort ?? "-createdAt",
    search: params?.search,
  };

  return useQuery({
    queryKey: qk.courses(key),
    queryFn: () => coursesApi.list(params),
    placeholderData: keepPreviousData,
  });
}