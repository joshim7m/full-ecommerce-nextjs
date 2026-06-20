import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { apiSuccess, apiError } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || name.length < 2) return apiError("Name must be at least 2 characters", 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return apiError("Invalid email", 400);
    if (!password || password.length < 8) return apiError("Password must be at least 8 characters", 400);
    if (!/[A-Z]/.test(password)) return apiError("Password must contain an uppercase letter", 400);
    if (!/[a-z]/.test(password)) return apiError("Password must contain a lowercase letter", 400);
    if (!/[0-9]/.test(password)) return apiError("Password must contain a number", 400);

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return apiError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: passwordHash,
        role: "USER",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash } });

    const res = apiSuccess({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken, expiresIn: 900 }, 201);
    res.headers.set("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/api/v1/auth; Max-Age=604800; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return apiError("Registration failed", 500);
  }
}
