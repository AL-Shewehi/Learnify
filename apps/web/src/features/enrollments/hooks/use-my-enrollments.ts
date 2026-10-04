"use client"

import { useQuery } from "@tanstack/react-query"
import { enrollmentsApi } from "../api/enrollments-api"

export function useMyEnrollments() {
    return useQuery({
        queryKey: ["my-enrollments"],
        queryFn: enrollmentsApi.myEnrollments,
        staleTime: 30_000
    })
}