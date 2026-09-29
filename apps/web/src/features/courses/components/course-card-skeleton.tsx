import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CourseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  );
}
