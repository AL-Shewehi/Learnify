"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  updateMeSchema,
  type ChangePasswordInput,
  type UpdateMeInput,
} from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/form/form-field";
import { useAuth } from "@/features/auth";
import {
  useChangePassword,
  useDeleteMe,
  useUpdateMe,
} from "@/features/auth/hooks/use-account";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { session } = useAuth();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();
  const deleteMe = useDeleteMe();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const profile = useForm<UpdateMeInput>({
    resolver: zodResolver(updateMeSchema),
    defaultValues: { name: session?.name, email: session?.email },
  });

  const password = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (session) {
      profile.reset({ name: session.name, email: session.email });
    }
  }, [session, profile]);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-2 font-display text-4xl">Settings</h1>
      </div>

      {/* Profile */}
      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="font-display text-xl">Profile</h2>
        <form
          onSubmit={profile.handleSubmit((input) => updateMe.mutate(input))}
          className="mt-5 space-y-5"
        >
          <FormField<UpdateMeInput>
            name="name"
            label="Name"
            register={profile.register}
            errors={profile.formState.errors}
          />
          <FormField<UpdateMeInput>
            name="email"
            label="Email"
            type="email"
            register={profile.register}
            errors={profile.formState.errors}
          />
          <Button type="submit" disabled={updateMe.isPending}>
            Save profile
          </Button>
        </form>
      </section>

      {/* Password */}
      <section className="rounded-md border border-border bg-card p-6">
        <h2 className="font-display text-xl">Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Changing it logs you out everywhere — old sessions are invalidated.
        </p>
        <form
          onSubmit={password.handleSubmit((input) =>
            changePassword.mutate(input),
          )}
          className="mt-5 space-y-5"
        >
          <FormField<ChangePasswordInput>
            name="currentPassword"
            label="Current password"
            type="password"
            register={password.register}
            errors={password.formState.errors}
            required
          />
          <FormField<ChangePasswordInput>
            name="newPassword"
            label="New password"
            type="password"
            register={password.register}
            errors={password.formState.errors}
            required
          />
          <FormField<ChangePasswordInput>
            name="confirmNewPassword"
            label="Confirm new password"
            type="password"
            register={password.register}
            errors={password.formState.errors}
            required
          />
          <Button type="submit" disabled={changePassword.isPending}>
            Change password
          </Button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-md border border-destructive/40 p-6">
        <h2 className="font-display text-xl text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deactivating hides your account and keeps your history for records.
        </p>
        <div className="mt-4">
          {confirmDelete ? (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                disabled={deleteMe.isPending}
                onClick={() => deleteMe.mutate()}
              >
                Yes, deactivate my account
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                Keep my account
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setConfirmDelete(true)}>
              Deactivate account
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
