"use client"

import { useQuery } from "@tanstack/react-query"
import { instructorApi } from "../api/instructor-api"

export function useCourseStudents(courseId: string) {
    return useQuery({
        queryKey: ["course-students", courseId],
        queryFn: () => instructorApi.students(courseId),
        staleTime: 30_000
    })
}