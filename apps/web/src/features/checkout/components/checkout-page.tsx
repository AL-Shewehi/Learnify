"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { checkoutSchema, type CheckoutInput } from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { CourseCover, useCourse } from "@/features/courses";
import { checkoutApi } from "../api/checkout-api";

export function CheckoutPage({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { data: course, isLoading } = useCourse(courseId);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expirationDate: "",
      cvc: "",
    },
  });

  const fillTestCard = () => {
    setValue("cardNumber", "4242 4242 4242 4242", { shouldValidate: true });
    setValue("cardHolder", "Test Learner", { shouldValidate: true });
    setValue("expirationDate", "12/29", { shouldValidate: true });
    setValue("cvc", "123", { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (input) => {
    try {
      const { receipt } = await checkoutApi.pay(courseId, input);
      toast.success(`Payment succeeded · ${receipt.id}`);
      router.push(`/my-learning/${courseId}`);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Payment failed",
      );
    }
  });

  if (isLoading || !course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center font-mono text-xs text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-10 sm:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Secure checkout · beta
      </p>
      <h1 className="mt-2 font-display text-4xl">Complete your enrollment</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Payment form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-center justify-between rounded-md border border-dashed border-border bg-card px-4 py-3">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Beta mode — no real money moves. Test card only.
            </p>
            <button
              type="button"
              onClick={fillTestCard}
              className="text-xs font-semibold text-primary underline underline-offset-4"
            >
              Fill test card
            </button>
          </div>

          <FormField<CheckoutInput>
            name="cardNumber"
            label="Card number"
            placeholder="4242 4242 4242 4242"
            register={register}
            errors={errors}
            required
          />

          <FormField<CheckoutInput>
            name="cardHolder"
            label="Name on card"
            placeholder="Test Learner"
            register={register}
            errors={errors}
            required
          />

          <div className="grid grid-cols-2 gap-5">
            <FormField<CheckoutInput>
              name="expirationDate"
              label="Expiry"
              placeholder="MM/YY"
              register={register}
              errors={errors}
              required
            />
            <FormField<CheckoutInput>
              name="cvc"
              label="CVC"
              placeholder="123"
              register={register}
              errors={errors}
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {isSubmitting
              ? "Processing..."
              : `Pay $${course.price.toLocaleString()}`}
          </Button>
        </form>

        {/* Order summary */}
        <aside className="h-fit rounded-md border border-border bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Order summary
          </p>

          <div className="mt-4 flex gap-3">
            <span className="h-16 w-24 shrink-0 overflow-hidden rounded relative">
              <CourseCover course={course} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display font-semibold">
                {course.title}
              </span>
              <span className="text-xs text-muted-foreground">
                by {course.instructor.name}
              </span>
            </span>
          </div>

          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Course price</dt>
              <dd>${course.price.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Lifetime access</dt>
              <dd>Included</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <dt>Total due today</dt>
              <dd>${course.price.toLocaleString()}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
