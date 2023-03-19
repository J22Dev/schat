import { ErrorRequestHandler } from "express";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  let message = err?.message ?? "Internal Error",
    statusCode = err?.statusCode ?? 500;
  return res.status(statusCode).json({ message });
};
