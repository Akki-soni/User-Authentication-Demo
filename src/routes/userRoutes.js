import {
  getProfile,
  isVerify,
  loginUser,
  registerUser,
  forgotPassword,
} from "../controllers/userControllers.js";

import userLoggedIn from "../middleware/userMiddleware.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify/:token", isVerify);
userRoutes.post("/login", loginUser);
userRoutes.get("/profile", userLoggedIn, getProfile);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password", forgotPassword);

export default userRoutes;
