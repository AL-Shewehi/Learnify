"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createLessonSchema,
  type CreateLessonInput,
  type LessonResponse,
  type SectionResponse,
} from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";

interface Props {
  courseId: string;
  initial?: LessonResponse;
  sections?: SectionResponse[];
  onCreate: (input: CreateLessonInput) => void;
  onUpdate: (input: CreateLessonInput) => void;
  onCancel: () => void;
  isPending: boolean;
}

const NO_SECTION = "__none";

const TYPE_OPTIONS = [
  { value: "video", label: "Video lesson" },
  { value: "article", label: "Article lesson" },
];

export function LessonForm({
  initial,
  sections = [],
  onCreate,
  onUpdate,
  onCancel,
  isPending,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLessonInput>({
    resolver: zodResolver(createLessonSchema),
    shouldUnregister: true,
    defaultValues: {
      type: "video",
      duration: 10,
      isPreview: false,
      sectionId: NO_SECTION,
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        description: initial.description,
        type: initial.type,
        videoUrl: initial.videoUrl,
        articleBody: initial.articleBody,
        duration: initial.duration,
        isPreview: initial.isPreview,
        sectionId:
          typeof initial.section === "string" ? initial.section : NO_SECTION,
      });
    }
  }, [initial, reset]);

  const type = useWatch({ control, name: "type" });

  const sectionOptions = [
    { value: NO_SECTION, label: "No section" },
    ...sections.map((s) => ({ value: s._id, label: s.title })),
  ];

  const onSubmit = handleSubmit(
    (input) => {
      const sectionId =
        !input.sectionId || input.sectionId === NO_SECTION
          ? null
          : input.sectionId;
      const clean: CreateLessonInput = {
        ...input,
        sectionId,
        videoUrl: input.type === "video" ? input.videoUrl : undefined,
        articleBody: input.type === "article" ? input.articleBody : undefined,
      };
      if (initial) onUpdate(clean);
      else onCreate(clean);
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0]?.message;
      toast.error(
        typeof firstError === "string"
          ? firstError
          : "Please complete the required lesson fields",
      );
    },
  );

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-md border border-border bg-card p-6"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {initial ? `Editing · lesson ${initial.order}` : "New lesson"}
      </p>

      <FormField<CreateLessonInput>
        name="title"
        label="Lesson title"
        placeholder="e.g. Streams without the mystery"
        register={register}
        errors={errors}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField<CreateLessonInput>
          name="type"
          label="Type"
          type="select"
          options={TYPE_OPTIONS}
          register={register}
          control={control}
          errors={errors}
        />
        <FormField<CreateLessonInput>
          name="duration"
          label="Duration (minutes)"
          type="number"
          register={register}
          errors={errors}
          required
        />
      </div>

      {type === "video" ? (
        <FormField<CreateLessonInput>
          name="videoUrl"
          label="Video URL (YouTube / Vimeo unlisted)"
          type="url"
          placeholder="https://youtube.com/watch?v=…"
          register={register}
          errors={errors}
          required
        />
      ) : (
        <FormField<CreateLessonInput>
          name="articleBody"
          label="Article content"
          type="textarea"
          placeholder="Write the lesson content…"
          register={register}
          errors={errors}
          required
        />
      )}

      <FormField<CreateLessonInput>
        name="description"
        label="Short description (optional)"
        type="textarea"
        placeholder="What does this lesson cover?"
        register={register}
        errors={errors}
      />

      {sectionOptions.length > 1 && (
        <FormField<CreateLessonInput>
          name="sectionId"
          label="Section (optional)"
          type="select"
          options={sectionOptions}
          register={register}
          control={control}
          errors={errors}
        />
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          {...register("isPreview")}
          className="h-4 w-4 rounded border-input accent-(--color-primary)"
        />
        Free preview — anyone can watch before enrolling
      </label>

      <div className="flex gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : initial ? "Save changes" : "Add lesson"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
