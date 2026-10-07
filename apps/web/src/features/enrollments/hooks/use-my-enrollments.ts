"use client"

import { useQuery } from "@tanstack/react-query"
import { enrollmentsApi } from "../api/enrollments-api"
import { qk } from "@/lib/query-keys"

export function useMyEnrollments() {
    return useQuery({
        queryKey: qk.myEnrollments,
        queryFn: enrollmentsApi.myEnrollments,
    })
}