import { CourseEditor } from "@/features/instructor";

export const metadata = { title: "Edit Course | Learnify" };

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;
  return <CourseEditor courseId={courseId} />;
}
