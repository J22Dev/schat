import dotenv from "dotenv";
dotenv.config();

export const JWT_A_SECRET = process.env.JWT_A_SECRET as string;
export const JWT_R_SECRET = process.env.JWT_R_SECRET as string;

export const JWT_ACCESS_CONFIG = {
  secret: JWT_A_SECRET,
  expiresIn: "15m",
};

export const JWT_REFRESH_CONFIG = {
  secret: JWT_R_SECRET,
  expiresIn: "7d",
};

export const NODE_ENV = process.env.NODE_ENV as string;
export const PORT = parseInt(process.env.PORT as string);

export const BUCKET_REGION = process.env.BUCKET_REGION as string;
export const BUCKET_NAME = process.env.BUCKET_NAME as string;
export const BUCKET_ENDPOINT = process.env.BUCKET_ENDPOINT as string;
export const BUCKET_SECRET_KEY = process.env.BUCKET_SECRET_KEY as string;
export const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY as string;
