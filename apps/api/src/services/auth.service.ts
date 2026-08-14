import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, UserRole, type UserRole as UserRoleValue } from "@goyatrio/database";
import { requireJwtSecret } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials.", 401, "INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      email: user.email,
      role: user.role,
    },
    requireJwtSecret(),
    {
      subject: user.id,
      expiresIn: "8h",
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export function assertAdminRole(role: UserRoleValue) {
  if (role !== UserRole.ADMIN) {
    throw new AppError("Admin access is required.", 403, "ADMIN_ACCESS_REQUIRED");
  }
}
