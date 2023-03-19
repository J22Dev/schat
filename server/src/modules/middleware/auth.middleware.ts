import { RequestHandler } from "express";
import { verifyUserToken } from "../auth/auth.utils";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization || req.headers["Authorization"];
    if (!authHeader) return res.status(401).json({ message: "Not Authorized" });
    const token = (authHeader as string).split(" ")[1];
    const decoded = await verifyUserToken({ type: "ACCESS", payload: token });
    if (decoded instanceof Error)
      return res.status(401).json({ message: "Not Authorized" });
    (req as any).userId = decoded.sub;
    return next();
  } catch (error) {
    next(error);
  }
};
