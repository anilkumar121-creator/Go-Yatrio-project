import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@goyatrio/database";
import { requireJwtSecret } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError("Authentication token is required.", 401, "AUTH_TOKEN_REQUIRED"));
    return;
  }

  try {
    (request as AuthenticatedRequest).user = jwt.verify(token, requireJwtSecret()) as JwtPayload;
    next();
  } catch {
    next(new AppError("Invalid or expired authentication token.", 401, "AUTH_TOKEN_INVALID"));
  }
}

export function requireAdmin(request: Request, _response: Response, next: NextFunction) {
  if ((request as AuthenticatedRequest).user?.role !== UserRole.ADMIN) {
    next(new AppError("Admin access is required.", 403, "ADMIN_ACCESS_REQUIRED"));
    return;
  }

  next();
}
