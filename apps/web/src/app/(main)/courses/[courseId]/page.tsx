import { CourseDetailsPage } from "@/features/courses";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetails({ params }: Props) {
  const { courseId } = await params;

  return <CourseDetailsPage courseId={courseId} />;
}

export async function generateMetadata({ params }: Props) {
  const { courseId } = await params;
  return {
    title: `Course ${courseId} | Learnify`,
    description: "Course details on Learnify.",
  };
}