import { CheckoutPage } from "@/features/checkout";

export const metadata = { title: "Checkout | Learnify" };

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function CheckoutRoute({ params }: Props) {
  const { courseId } = await params;
  return <CheckoutPage courseId={courseId} />;
}