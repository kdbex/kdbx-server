import express from "express";
import fs from "fs";
import cors from "cors";
import bodyParser from "body-parser";
import { Kdbx } from "kdbxweb";
import path from "path";
import process from "process";
import router from "./router";
import auth from './auth';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { checkFolder, getConfig } from "./util/file";
import { info } from "./util/logger";

const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'KdbxServer',
			version: '1.0.0'
		}
	},
	apis: ['./src/router.ts', './src/model.ts']
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

app.use(cors())
	.use(bodyParser.json())
	.use(auth)
	.use(router)
	.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)).listen(port, () => {
	info(`Server successfuly started on ${port}`);
})