"use client";

import { useSession } from "../hooks/use-session";

export function SessionSync() {
  useSession();
  return null;
}