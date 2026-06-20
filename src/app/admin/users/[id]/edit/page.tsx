"use client";

import { useParams } from "next/navigation";
import { UserForm } from "@/components/admin/users/user-form";
import { USERS } from "@/lib/mock-data";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const user = USERS.find((u) => u.id === id) ?? null;
  return <UserForm user={user} mode="edit" />;
}
