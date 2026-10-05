"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "../hooks/use-admin";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Users */}
      <section>
        <h2 className="font-display text-2xl">People</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Total users" value={String(stats.users.total)} />
          <StatTile label="Students" value={String(stats.users.students)} />
          <StatTile
            label="Instructors"
            value={String(stats.users.instructors)}
          />
          <StatTile label="Active" value={String(stats.users.active)} />
        </div>
      </section>

      {/* Courses */}
      <section>
        <h2 className="font-display text-2xl">Catalog</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Courses" value={String(stats.courses.total)} />
          <StatTile label="Published" value={String(stats.courses.published)} />
          <StatTile label="Drafts" value={String(stats.courses.draft)} />
          <StatTile label="Archived" value={String(stats.courses.archived)} />
        </div>
      </section>

      {/* Learning + money */}
      <section>
        <h2 className="font-display text-2xl">Learning & revenue</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Enrollments"
            value={String(stats.enrollments.total)}
          />
          <StatTile
            label="Completed"
            value={String(stats.enrollments.completed)}
          />
          <StatTile
            label="Revenue"
            value={`$${stats.revenue.total.toLocaleString()}`}
          />
          <StatTile
            label="Avg. order"
            value={`$${stats.revenue.averagePrice.toFixed(2)}`}
          />
        </div>
      </section>
    </div>
  );
}
