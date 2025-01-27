import express, { NextFunction, Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Kdbx } from "kdbxweb";
import router from "./router";
import auth from "./auth";
import swaggerUi from "swagger-ui-express";
import { info } from "./util/logger";
import swaggerJSDoc from "swagger-jsdoc";
import { getConfig, initConfig } from "./util/config";

//Generates the openapi documentation
const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KdbxServer",
      version: "2.0.0",
    },
  },
  apis: ["./src/router.ts", "./src/model.ts"],
});
const app = express();
export var base: Kdbx;
export var loginToken: string;

export function registerToken(b: Kdbx, token: string) {
  base = b;
  loginToken = token;
}

initConfig();
const port = getConfig().port;

//We log every received request for logging purposes
const logRouter = Router();
logRouter.use((req, _, next) => {
  console.debug("Received request :", req.method, req.url, req.body);
  next();
});

app
  .use(logRouter)
  .use(cors())
  .use(bodyParser.json())
  .use(auth)
  .use(router)
  .use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  .listen(port, () => {
    info(`Server successfuly started on ${port}`);
  });