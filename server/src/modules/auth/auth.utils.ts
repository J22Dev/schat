import jwt from "jsonwebtoken";
import argon from "argon2";
import { JWT_ACCESS_CONFIG, JWT_REFRESH_CONFIG } from "../config/config";

export const hashPassword = (password: string) => argon.hash(password);
export const verifyHashedPass = (hash: string, plain: string) =>
  argon.verify(hash, plain);

type TokenType = "ACCESS" | "REFRESH";
type TokenPayload = Record<string, string> & { sub: string };
type SignTokenPayload = { type: TokenType; payload: TokenPayload };
type VerifyTokenPayload = { type: TokenType; payload: string };

export const signToken = (p: SignTokenPayload) => {
  const { secret, expiresIn } =
    p.type === "ACCESS" ? JWT_ACCESS_CONFIG : JWT_REFRESH_CONFIG;
  return jwt.sign(p.payload, secret, { expiresIn });
};

export const signUserTokens = (p: TokenPayload) => {
  return {
    accessToken: signToken({ type: "ACCESS", payload: p }),
    refreshToken: signToken({ type: "REFRESH", payload: p }),
  };
};

export const verifyUserToken = async (
  p: VerifyTokenPayload
): Promise<Error | TokenPayload> => {
  return new Promise((res, rej) => {
    jwt.verify(
      p.payload,
      p.type === "ACCESS"
        ? JWT_ACCESS_CONFIG.secret
        : JWT_REFRESH_CONFIG.secret,
      (err, decoded) => {
        if (err) rej({ message: "Token Not Valid" });
        res(decoded as TokenPayload);
      }
    );
  });
};
