"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { USERS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import type { User, UserRole } from "@/lib/types";

interface UserFormProps {
  user?: User | null;
  mode: "create" | "edit";
}

export function UserForm({ user, mode }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = mode === "edit" && user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "USER");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Missing required fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }

    if (isEdit && user) {
      const idx = USERS.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        USERS[idx] = { ...USERS[idx], name, email, role };
      }
      toast({ title: "User updated", description: name });
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        phone: null,
        avatarUrl: null,
        role,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      };
      USERS.push(newUser);
      toast({ title: "User created", description: name });
    }
    router.push("/admin/users");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? "Edit User" : "Create User"}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update user details" : "Add a new user account"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Name, email and role</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="u-name">Name <span className="text-destructive">*</span></Label>
              <Input id="u-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="u-email">Email <span className="text-destructive">*</span></Label>
              <Input id="u-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="font-mono" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="u-role">Role</Label>
              <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 border-t pt-4">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
