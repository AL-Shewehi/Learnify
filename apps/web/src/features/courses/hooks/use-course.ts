"use client"

import { useQuery } from "@tanstack/react-query"
import { coursesApi } from "../api/courses-api"

export function useCourse(id: string) {
    return useQuery({
        queryKey: ["course", id],
        queryFn: () => coursesApi.getById(id),
        staleTime: 60_000
    })
}