"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { USER_ROLES } from "@learnify/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/features/courses";
import { useAuth } from "@/features/auth";
import { useDebounce } from "@/hooks/use-debounce";
import { useAdminActions, useAdminUsers } from "../hooks/use-admin";

export function AdminUsers() {
  const { session } = useAuth();
  const actions = useAdminActions();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: role as never,
    isActive: status as never,
  });

  const users = data?.users ?? [];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 border-y border-border py-4 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email…"
            className="pl-9"
          />
        </div>

        <div className="flex gap-3 md:ml-auto">
          <Select
            value={role ?? "__all"}
            onValueChange={(v) => {
              setRole(v === "__all" ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All roles</SelectItem>
              {USER_ROLES.map((r) => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status ?? "__all"}
            onValueChange={(v) => {
              setStatus(v === "__all" ? undefined : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-md border border-dashed border-border py-16 text-center">
            <p className="font-display text-xl">No users match</p>
          </div>
        ) : (
          <ol className="divide-y divide-border border-y border-border">
            {users.map((user) => {
              const isSelf = user._id === session?._id;
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <li key={user._id} className="flex flex-wrap items-center gap-4 py-4">
                  {/* User */}
                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {user.name}
                        {isSelf && (
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                            (you)
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user.email} · joined{" "}
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </span>

                  {/* Role */}
                  <Select
                    value={user.role}
                    disabled={isSelf || actions.updateRole.isPending}
                    onValueChange={(role) =>
                      actions.updateRole.mutate({ id: user._id, role })
                    }
                  >
                    <SelectTrigger className="w-32 capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Active toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSelf}
                    onClick={() =>
                      actions.toggleActive.mutate({
                        id: user._id,
                        isActive: !user.isActive,
                      })
                    }
                    className={user.isActive ? "" : "border-rose-300 text-rose-700"}
                  >
                    {user.isActive ? "Active" : "Deactivated"}
                  </Button>

                  {/* Delete */}
                  {confirmDelete === user._id ? (
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          actions.remove.mutate(user._id, {
                            onSuccess: () => setConfirmDelete(null),
                          })
                        }
                        className="text-xs font-semibold text-destructive underline underline-offset-4"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-muted-foreground"
                      >
                        Keep
                      </button>
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isSelf}
                      onClick={() => setConfirmDelete(user._id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onChange={setPage}
        />
      )}
    </div>
  );
}