"use client"

import { Button } from "@/components/ui/button";
import { EmptyState, SectionEyebrow } from "@/components/ui";
import { useCourses } from "../hooks/use-courses";
import { useCourseFilters } from "../hooks/use-course-filters";
import { CourseCard } from "./course-card";
import { CourseCardSkeleton } from "./course-card-skeleton";
import { CourseFiltersBar } from "./course-filters-bar";
import { Pagination } from "./pagination";

export function CoursesBrowser() {
    const {filters, setFilters} = useCourseFilters();

    const {data, isLoading, isError, refetch} = useCourses(filters);

    const pagination = data?.pagination;
    const from = pagination ? (pagination.page -1 ) * pagination.limit +1 : 0;
    const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

     return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow>The catalog</SectionEyebrow>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">
            Browse courses
          </h1>
        </div>
        {pagination && pagination.total > 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            Showing {from}–{to} of {pagination.total}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="mt-8">
        <CourseFiltersBar filters={filters} onChange={setFilters} />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          className="mt-8"
          title="Something went wrong"
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : (data?.courses.length ?? 0) === 0 ? (
        <EmptyState
          className="mt-8"
          title="No courses match your filters"
          action={
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: undefined,
                  subject: undefined,
                  level: undefined,
                })
              }
            >
              Clear all filters
            </Button>
          }
        />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.courses ?? []).map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={(page) => setFilters({ page })}
        />
      )}
    </>
  );
}