"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/format";

export default function ProfilePage() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          You need to log in to view your profile.
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  const initials = getInitials(session.name);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-2 font-display text-4xl">Profile</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </div>
          <div>
            <CardTitle>{session.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{session.email}</p>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize">
            {session.role}
          </span>
          <Button asChild variant="outline">
            <Link href="/settings">Edit in Settings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
