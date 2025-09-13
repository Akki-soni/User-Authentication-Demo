import {
  resetPassword,
  getProfile,
  isVerify,
  loginUser,
  registerUser,
  forgotPassword,
  logoutUser,
  resendVerificationEmail,
  changePassword,
} from "../controllers/userControllers.js";

import userLoggedIn from "../middleware/userMiddleware.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.get("/verify/:token", isVerify);
userRoutes.post("/login", loginUser);
userRoutes.get("/profile", userLoggedIn, getProfile);
userRoutes.post("/forgot-password", forgotPassword);
userRoutes.post("/reset-password/:token", resetPassword);
userRoutes.post("/change-password", userLoggedIn, changePassword);
userRoutes.get("/logout", userLoggedIn, logoutUser);
userRoutes.get("/reverify", userLoggedIn, resendVerificationEmail);

export default userRoutes;
