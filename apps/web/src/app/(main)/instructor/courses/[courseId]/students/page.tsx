import { CourseStudents } from "@/features/instructor";

export const metadata = { title: "Course Students | Learnify" };

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseStudentsPage({ params }: Props) {
  const { courseId } = await params;
  return <CourseStudents courseId={courseId} />;
}