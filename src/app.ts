import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { routerUser } from "./routers/user";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", true);
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/", routerUser);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
