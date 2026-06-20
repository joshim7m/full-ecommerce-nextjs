import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, apiSuccess, apiError } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const payload = getAuthUser(req);
    if (!payload) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, createdAt: true },
    });
    if (!user) return apiError("User not found", 404);

    return apiSuccess({ user });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
