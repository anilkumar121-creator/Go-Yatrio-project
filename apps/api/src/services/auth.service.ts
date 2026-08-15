import { compare, hash } from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma, UserRole, type UserRole as UserRoleValue } from "@goyatrio/database";
import { env, requireJwtSecret } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function comparePassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return compare(plainPassword, passwordHash);
}

function sanitizeUser(user: { id: string; name: string; email: string; role: UserRoleValue; isActive: boolean; createdAt: Date }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export function generateAccessToken(payload: { userId: string; role: UserRoleValue; email: string }) {
  return jwt.sign(
    {
      email: payload.email,
      role: payload.role,
    },
    requireJwtSecret(),
    {
      subject: payload.userId,
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    },
  );
}

export async function generateRefreshToken(userId: string) {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (process.env.DATABASE_URL) {
    try {
      await prisma.refreshToken.create({
        data: {
          userId,
          token,
          expiresAt,
        },
      });
    } catch {
      // Graceful fallback if db table isn't migrated yet in dev
    }
  }

  return { token, expiresAt };
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  if (process.env.DATABASE_URL) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError("A user with this email already exists.", 400, "EMAIL_EXISTS");
    }
  }

  const passwordHash = await hashPassword(data.password);

  let user = {
    id: "dev_user_" + Date.now(),
    name: data.name,
    email: data.email,
    role: UserRole.CUSTOMER,
    isActive: true,
    createdAt: new Date(),
  };

  if (process.env.DATABASE_URL) {
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: UserRole.CUSTOMER,
        isActive: true,
      },
    });
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
  const refreshToken = await generateRefreshToken(user.id);

  return {
    token: accessToken,
    accessToken,
    refreshToken: refreshToken.token,
    user: sanitizeUser(user),
  };
}

export async function loginUser(email: string, password: string) {
  if (!process.env.DATABASE_URL) {
    // Development fallback without active DB
    if (email === "admin.dev@goyatrio.local" && password === "ChangeMe.dev.only.123") {
      const devAdmin = {
        id: "dev_admin_id",
        name: "GoYatrio Dev Admin",
        email: "admin.dev@goyatrio.local",
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
      };
      const accessToken = generateAccessToken({ userId: devAdmin.id, role: devAdmin.role, email: devAdmin.email });
      return {
        token: accessToken,
        accessToken,
        refreshToken: "dev_refresh_token",
        user: sanitizeUser(devAdmin),
      };
    }
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role, email: user.email });
  const refreshToken = await generateRefreshToken(user.id);

  return {
    token: accessToken,
    accessToken,
    refreshToken: refreshToken.token,
    user: sanitizeUser(user),
  };
}

export async function loginAdmin(email: string, password: string) {
  const result = await loginUser(email, password);
  assertAdminRole(result.user.role);
  return result;
}

export async function refreshSession(refreshTokenInput: string) {
  if (!process.env.DATABASE_URL) {
    if (refreshTokenInput === "dev_refresh_token") {
      const devAdmin = {
        id: "dev_admin_id",
        name: "GoYatrio Dev Admin",
        email: "admin.dev@goyatrio.local",
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: new Date(),
      };
      const accessToken = generateAccessToken({ userId: devAdmin.id, role: devAdmin.role, email: devAdmin.email });
      return {
        accessToken,
        refreshToken: "dev_refresh_token",
        user: sanitizeUser(devAdmin),
      };
    }
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshTokenInput },
    include: { user: true },
  });

  if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    throw new AppError("Invalid or expired refresh token.", 401, "REFRESH_TOKEN_INVALID");
  }

  if (!storedToken.user || !storedToken.user.isActive) {
    throw new AppError("User account is inactive.", 401, "ACCOUNT_INACTIVE");
  }

  // Revoke old refresh token (Token rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { isRevoked: true },
  });

  const accessToken = generateAccessToken({
    userId: storedToken.user.id,
    role: storedToken.user.role,
    email: storedToken.user.email,
  });

  const newRefreshToken = await generateRefreshToken(storedToken.user.id);

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
    user: sanitizeUser(storedToken.user),
  };
}

export async function logoutUser(userId: string, refreshTokenInput?: string) {
  if (process.env.DATABASE_URL) {
    if (refreshTokenInput) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshTokenInput, userId },
        data: { isRevoked: true },
      });
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }
  }

  return { success: true, message: "Logged out successfully." };
}

export async function getCurrentUser(userId: string) {
  if (!process.env.DATABASE_URL && userId === "dev_admin_id") {
    return {
      id: "dev_admin_id",
      name: "GoYatrio Dev Admin",
      email: "admin.dev@goyatrio.local",
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
    };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new AppError("User not found or account is inactive.", 404, "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  if (!process.env.DATABASE_URL && userId === "dev_admin_id") {
    if (currentPassword !== "ChangeMe.dev.only.123") {
      throw new AppError("Current password is incorrect.", 400, "CURRENT_PASSWORD_INCORRECT");
    }
    return { success: true, message: "Password updated successfully." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.isActive) {
    throw new AppError("User not found or account is inactive.", 404, "USER_NOT_FOUND");
  }

  const isCurrentValid = await comparePassword(currentPassword, user.passwordHash);

  if (!isCurrentValid) {
    throw new AppError("Current password is incorrect.", 400, "CURRENT_PASSWORD_INCORRECT");
  }

  const newPasswordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  // Revoke all existing refresh sessions for security
  await prisma.refreshToken.updateMany({
    where: { userId, isRevoked: false },
    data: { isRevoked: true },
  });

  return { success: true, message: "Password changed successfully." };
}

export function assertAdminRole(role: UserRoleValue) {
  if (role !== UserRole.ADMIN) {
    throw new AppError("Admin access is required.", 403, "ADMIN_ACCESS_REQUIRED");
  }
}