import { LessonsManager } from "@/features/lessons";

export const metadata = {
  title: "Manage Lessons | Learnify",
};

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function ManageLessonsPage({ params }: Props) {
  const { courseId } = await params;
  return <LessonsManager courseId={courseId} />;
}