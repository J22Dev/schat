import { Router } from "express";
import {
  deleteUserHandler,
  getManyUsersHandler,
  getSingleUserHandler,
  updateUserHandler,
} from "./users.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createProfileHandler,
  deleteProfileHandler,
  getProfileHandler,
  updateProfileHandler,
} from "./profile.controller";
import { S3ObjectACL, configureUpload } from "../config/upload";
import { BUCKET_NAME } from "../config/config";

const profileUpload = configureUpload({
  acceptedTypes: ["image/png", "image/webp", "image/jpeg"],
  bucket: BUCKET_NAME,
  acl: S3ObjectACL.PUBLIC_READ,
});

export const userRouter = Router();

userRouter
  .get("/:userId/profile", authMiddleware, getProfileHandler)
  .post(
    "/:userId/profile",
    authMiddleware,
    profileUpload.single("avatar"),
    createProfileHandler
  )
  .put(
    "/:userId/profile",
    authMiddleware,
    profileUpload.single("avatar"),
    updateProfileHandler
  )
  .delete("/:userId/profile", authMiddleware, deleteProfileHandler) // Not Implemented Yet
  .get("/:userId", authMiddleware, getSingleUserHandler)
  .get("/", authMiddleware, getManyUsersHandler)
  .put("/:userId", authMiddleware, updateUserHandler)
  .delete("/:userId", authMiddleware, deleteUserHandler); // Not Implemented Yet
