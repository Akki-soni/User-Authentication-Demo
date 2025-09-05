import { isVerify, registerUser } from "../controllers/userControllers.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/verify/:token", isVerify);

export default userRoutes;
