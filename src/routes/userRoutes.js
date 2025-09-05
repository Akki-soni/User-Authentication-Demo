import { registerUser } from "../controllers/userControllers.js";
import { Router } from "express";

const userRoutes = Router();

userRoutes.post("/register", registerUser);

export default userRoutes;
