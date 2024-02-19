import express, { NextFunction, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Kdbx } from "kdbxweb";
import router from "./router";
import auth from "./auth";
import swaggerUi from "swagger-ui-express";
import { checkFolder, getConfig } from "./util/file";
import { info } from "./util/logger";
import swaggerJSDoc from "swagger-jsdoc";

const dev = process.argv.includes("--dev");
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KdbxServer",
      version: "1.0.0",
    },
  },
  apis: ["./src/router.ts", "./src/model.ts"],
});
checkFolder();
const app = express();
const port = getConfig().port;
export var base: Kdbx;
export var loginToken: string;

export function registerToken(b: Kdbx, token: string) {
  base = b;
  loginToken = token;
}

const logRouter = Router();

logRouter.use((req, res, next) => {
  console.debug("Received request :", req.method, req.url, req.body);
  next();
});

app
  .use(cors())
  .use(bodyParser.json())
  .use(logRouter)
  .use(auth)
  .use(router)
  .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  .listen(port, () => {
    info(`Server successfuly started on ${port}`);
  });
