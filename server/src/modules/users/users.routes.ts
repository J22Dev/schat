import { Router } from "express";
import { updateUserHandler } from "./users.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export const userRouter = Router();

userRouter
  .put("/:userId", authMiddleware, updateUserHandler)
  .post("/:userId/profile", authMiddleware)
  .put("/:userId/profile", authMiddleware)
  .get("/:userId/profile", authMiddleware)
  .delete("/:userId/profile", authMiddleware);
