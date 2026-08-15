import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendSuccess } from "../utils/api-response.js";
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../validators/schemas.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { AppError } from "../utils/app-error.js";

export const register = asyncHandler(async (request, response) => {
  const input = registerSchema.parse(request.body);
  const result = await registerUser(input);

  sendSuccess(response, result, 201);
});

export const login = asyncHandler(async (request, response) => {
  const credentials = loginSchema.parse(request.body);
  const result = await loginUser(credentials.email, credentials.password);

  sendSuccess(response, result);
});

export const logout = asyncHandler(async (request, response) => {
  const authReq = request as AuthenticatedRequest;
  const userId = authReq.user?.sub;

  if (!userId) {
    throw new AppError("Authentication required.", 401, "UNAUTHENTICATED");
  }

  const refreshToken = request.body?.refreshToken;
  const result = await logoutUser(userId, refreshToken);

  sendSuccess(response, result);
});

export const getMe = asyncHandler(async (request, response) => {
  const authReq = request as AuthenticatedRequest;
  const userId = authReq.user?.sub;

  if (!userId) {
    throw new AppError("Authentication required.", 401, "UNAUTHENTICATED");
  }

  const user = await getCurrentUser(userId);

  sendSuccess(response, { user });
});

export const refresh = asyncHandler(async (request, response) => {
  const body = refreshTokenSchema.parse(request.body);
  const tokenInput = body.refreshToken ?? request.headers["x-refresh-token"];

  if (typeof tokenInput !== "string") {
    throw new AppError("Refresh token is required.", 400, "REFRESH_TOKEN_REQUIRED");
  }

  const result = await refreshSession(tokenInput);

  sendSuccess(response, result);
});

export const changePasswordController = asyncHandler(async (request, response) => {
  const authReq = request as AuthenticatedRequest;
  const userId = authReq.user?.sub;

  if (!userId) {
    throw new AppError("Authentication required.", 401, "UNAUTHENTICATED");
  }

  const input = changePasswordSchema.parse(request.body);
  const result = await changePassword(userId, input.currentPassword, input.newPassword);

  sendSuccess(response, result);
});