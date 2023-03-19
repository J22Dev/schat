import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./modules/config/config";
import { cleanUploads } from "./modules/config/upload";

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(cookieParser());

const main = async () => {
  app.listen(PORT, () => console.log(`Running On ${PORT}`));
  // await cleanUploads();
};

main();
