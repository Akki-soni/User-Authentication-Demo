import {
  isVerify,
  loginUser,
  registerUser,
} from "../controllers/userControllers.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify/:token", isVerify);
userRoutes.post("/login", loginUser);

export default userRoutes;
