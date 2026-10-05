"use client"

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
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The catalog
          </p>
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
        <div className="mt-8 rounded-md border border-border py-16 text-center">
          <p className="font-display text-xl">Something went wrong</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium underline underline-offset-4 hover:text-primary"
          >
            Try again
          </button>
        </div>
      ) : (data?.courses.length ?? 0) === 0 ? (
        <div className="mt-8 rounded-md border border-border py-16 text-center">
          <p className="font-display text-xl">No courses match your filters</p>
          <button
            onClick={() => setFilters({ search: undefined, subject: undefined, level: undefined })}
            className="mt-3 text-sm font-medium underline underline-offset-4 hover:text-primary"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data!.courses.map((course) => (
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