import { Router } from "express";
import {
  loginUserHandler,
  refreshUserHandler,
  registerUserHandler,
  signOutHandler,
} from "./auth.controller";

export const authRouter = Router();

authRouter
  .post("/register", registerUserHandler)
  .post("/login", loginUserHandler)
  .get("/refresh", refreshUserHandler)
  .get("/logout", signOutHandler);
