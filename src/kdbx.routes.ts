import { decrypt } from "./util/crypt";
import { getConfig } from "./util/file";
import {error, info} from "./util/logger";
import * as kdbx from "kdbxweb";
import fs from "fs";
import { EntryCreation, EntryRequest, EntryUpdate, KdbxPartEntry, LoginResponse, SetupVerification } from "./model";
import { AES, enc } from "crypto-js";
import cors from "cors";
import bodyParser from "body-parser";
import { Kdbx } from "kdbxweb";
import { randomBytes } from "crypto";
import { base, loginToken, registerToken } from "./app";

//All the functions to get directly the data from an entry

function url(entry: kdbx.KdbxEntry): string {
	return entry.fields.get("URL").toString();
}
function title(entry: kdbx.KdbxEntry): string {
	return entry.fields.get("Title").toString();
}
function username(entry: kdbx.KdbxEntry): string {
	return entry.fields.get("UserName").toString();
}
function password(entry: kdbx.KdbxEntry): string {
	return (<kdbx.ProtectedValue>entry.fields.get("Password")).getText();
}

/**
 * @openapi
 * /setup:
 *   post:
 *      description: Makes a check to verify if the token has been correctly filled on the client side
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/SetupVerification'
 *      responses:
 *          200:
 *              content:
 *                  boolean
 *              description: Whether or not the token is correctly filled.
 */
export function setup(verif: SetupVerification): boolean {
    let cmp = verif.message == decrypt(verif.hash, getConfig().token);
	if (cmp) {
		info("Setup has been done correctly, token is ok");
	}
	return cmp
}

function toArrayBuffer(buf: Buffer) {
	const ab = new ArrayBuffer(buf.length);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

export async function login(password: string): Promise<LoginResponse | { message: string, status: boolean}> {
	let credentials = new kdbx.Credentials(kdbx.ProtectedValue.fromString(password));
	return fs.promises.readFile(getConfig().filePath)
		
		.then((data) => kdbx.Kdbx.load(toArrayBuffer(data), credentials).then((db) => {
			var token = randomBytes(128);
			registerToken(db, token);
			return { token: token.toJSON(), status: true };
		})
		.catch((reason) => {
			info("Wrong password");
			console.log("Reason", reason);
			return { message: "Wrong password", status: false };
		}))
		.catch((err) => {
			error("Internal error : " + err);
			return { message: "Internal error", status: false };
		})
}