import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@goyatrio/database";
import { requireJwtSecret } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

export function verifyJWT(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError("Authentication token is required.", 401, "AUTH_TOKEN_REQUIRED"));
    return;
  }

  try {
    const verified = jwt.verify(token, requireJwtSecret()) as JwtPayload;
    (request as AuthenticatedRequest).user = verified;
    next();
  } catch {
    next(new AppError("Invalid or expired authentication token.", 401, "AUTH_TOKEN_INVALID"));
  }
}

export const authenticate = verifyJWT;

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {

  if ((request as AuthenticatedRequest).user?.role !== UserRole.ADMIN) {
    next(new AppError("Admin access is required.", 403, "ADMIN_ACCESS_REQUIRED"));
    return;
  }

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const userRole = (request as AuthenticatedRequest).user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      next(new AppError("Insufficient permissions.", 403, "INSUFFICIENT_PERMISSIONS"));
      return;
    }

    next();
  };
}