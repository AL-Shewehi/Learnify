import { Suspense } from "react";
import { LearningPage } from "@/features/lessons";

export const metadata = { title: "Learning | Learnify" };

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function LearningRoute({ params }: Props) {
  const { courseId } = await params;
  return (
    <Suspense fallback={<div className="py-6" />}>
      <LearningPage courseId={courseId} />
    </Suspense>
  );
}
