import { AdminUsers } from "@/features/admin"; 

export const metadata = { title: "Manage Users | Learnify" };

export default function AdminUsersPage() {
  return (
    <>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        Admin · people
      </p>
      <h1 className="mt-2 mb-8 font-display text-4xl">Users</h1>
      <AdminUsers />
    </>
  );
}