"use clinet"
import { useQuery } from "@tanstack/react-query"
import { instructorApi } from "../api/instructor-api"

export function useMyCourses() {
    return useQuery({
        queryKey: ["my-courses"],
        queryFn: () => instructorApi.myCourses(),
        staleTime: 60_000
    })
}