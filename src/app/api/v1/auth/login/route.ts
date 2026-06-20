import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) return apiError("Email and password are required", 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password) return apiError("Invalid email or password", 401);
    if (user.status !== "ACTIVE") return apiError("Account is suspended", 403);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return apiError("Invalid email or password", 401);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash, lastLoginAt: new Date() } });

    const res = apiSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, expiresIn: 900 });
    res.headers.set("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/api/v1/auth; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return apiError("Login failed", 500);
  }
}
