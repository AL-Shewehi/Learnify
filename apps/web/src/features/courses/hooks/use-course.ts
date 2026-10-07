"use client"

import { useQuery } from "@tanstack/react-query"
import { coursesApi } from "../api/courses-api"
import { qk } from "@/lib/query-keys"

export function useCourse(id: string) {
    return useQuery({
        queryKey: qk.course(id),
        queryFn: () => coursesApi.getById(id),
    })
}