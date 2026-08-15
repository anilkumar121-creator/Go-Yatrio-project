import { Router } from "express";
import {
  changePasswordController,
  getMe,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", verifyJWT, logout);
authRouter.get("/me", verifyJWT, getMe);
authRouter.post("/refresh", refresh);
authRouter.post("/change-password", verifyJWT, changePasswordController);