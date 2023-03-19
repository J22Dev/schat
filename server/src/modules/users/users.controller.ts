import { RequestHandler } from "express";
import { GetUsersModel, UserUpdateModel } from "./users.models";
import { db } from "../config/db";
import {
  hashPassword,
  signUserTokens,
  verifyHashedPass,
} from "../auth/auth.utils";
import { USER_SELECT } from "../auth/auth.controller";
import { COOKIE_CONFIG } from "../config/config";

export const updateUserHandler: RequestHandler = async (req, res, next) => {
  try {
    // Verify Requester Is User
    const requesterId = (req as any).userId;
    const userId = req.params.userId;
    if (requesterId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    // Find User
    const { password, newPassword, ...rest } = req.body as UserUpdateModel;
    const foundUser = await db.user.findUnique({ where: { id: userId } });
    if (!foundUser) return res.status(403).json({ message: "Forbidden" });
    // Verify Password
    const validPass = await verifyHashedPass(foundUser.password, password);
    if (!validPass) return res.status(401).json({ message: "Not Authorized" });
    const hashedPassword = newPassword
      ? await hashPassword(newPassword)
      : foundUser.password;
    // Verify User Name and Email
    const userNameValid =
      rest.userName === foundUser.userName ||
      !(await db.user.findUnique({
        where: { userName: rest.userName },
      }));
    if (!userNameValid)
      return res.status(400).json({ message: "User Name In Use" });
    const emailValid =
      rest.email === foundUser.email ||
      !(await db.user.findUnique({
        where: { email: rest.email },
      }));
    if (!emailValid) return res.status(400).json({ message: "Email In Use" });
    // Update User
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...rest,
        password: hashedPassword,
      },
      select: USER_SELECT,
    });
    // Sign Tokens
    const tokens = signUserTokens({ sub: foundUser.id });
    await db.userToken.update({
      where: { userId },
      data: { token: tokens.refreshToken },
    });
    return res
      .cookie("rToken", tokens.refreshToken, COOKIE_CONFIG)
      .status(201)
      .json({ user: updatedUser, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

export const getSingleUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const foundUser = await db.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!foundUser) return res.status(404).json({ message: "User Not Found" });
    return res.status(200).json(foundUser);
  } catch (error) {
    next(error);
  }
};

export const getManyUsersHandler: RequestHandler = async (req, res, next) => {
  try {
    const { query, page, size } = req.query as GetUsersModel;
    const skip = (parseInt(page) - 1) * parseInt(size);
    const foundUsers = await db.user.findMany({
      where: {
        OR: [
          { userName: { startsWith: query } },
          { email: { startsWith: query } },
        ],
      },
      select: USER_SELECT,
      take: parseInt(size),
      skip,
    });
    if (!foundUsers) return res.status(404).json({ message: "No Users Found" });
    return res.status(200).json([...foundUsers]);
  } catch (error) {
    next(error);
  }
};

export const deleteUserHandler: RequestHandler = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
