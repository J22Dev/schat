import { RequestHandler } from "express";
import { UserLoginModel, UserRegisterModel } from "./auth.models";
import { db } from "../config/db";
import {
  hashPassword,
  signUserTokens,
  verifyHashedPass,
  verifyUserToken,
} from "./auth.utils";
import { COOKIE_CONFIG } from "../config/config";

export const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  userName: true,
  createdAt: true,
  updatedAt: true,
};
export const registerUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userData = req.body as UserRegisterModel;
    const foundUser = await db.user.findFirst({
      where: {
        OR: [{ email: userData.email }, { userName: userData.userName }],
      },
    });
    if (foundUser) {
      return res.status(400).json({
        message:
          foundUser.email === userData.email
            ? "Email In Use"
            : "User Name In Use",
      });
    }
    const newUser = await db.user.create({
      data: { ...userData, password: await hashPassword(userData.password) },
      select: USER_SELECT,
    });
    const tokens = signUserTokens({ sub: newUser.id });
    const dbToken = await db.userToken.create({
      data: { userId: newUser.id, token: tokens.refreshToken },
    });
    return res
      .cookie("rToken", tokens.refreshToken, COOKIE_CONFIG)
      .status(201)
      .json({ user: newUser, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

export const loginUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userData = req.body as UserLoginModel;
    const foundUser = await db.user.findUnique({
      where: { email: userData.email },
    });
    if (!foundUser) return res.status(401).json({ message: "Not Authorized" });
    const { password, role, ...rest } = foundUser;
    const passwordValid = await verifyHashedPass(password, userData.password);
    if (!passwordValid)
      return res.status(401).json({ message: "Not Authorized" });
    const tokens = signUserTokens({ sub: rest.id });
    const dbToken = await db.userToken.update({
      where: { userId: rest.id },
      data: { token: tokens.refreshToken },
    });
    return res
      .cookie("rToken", tokens.refreshToken, COOKIE_CONFIG)
      .status(201)
      .json({ user: rest, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

export const refreshUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.rToken;
    if (!token) return res.status(401);
    const decoded = await verifyUserToken({ type: "REFRESH", payload: token });
    if (decoded instanceof Error)
      return res.status(401).json({ message: "Not Authorized" });
    const foundUser = await db.user.findUnique({
      where: { id: decoded.sub },
      select: USER_SELECT,
    });
    if (!foundUser) return res.status(403).json({ message: "Forbidden" });
    const tokens = signUserTokens({ sub: foundUser.id });
    return res
      .status(200)
      .json({ user: foundUser, accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};
export const signOutHandler: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies.rToken;
    if (!token) return res.status(200).json({ message: "Signed Out" });
    return res
      .clearCookie("rToken")
      .status(200)
      .json({ message: "Signed Out" });
  } catch (error) {
    next(error);
  }
};
