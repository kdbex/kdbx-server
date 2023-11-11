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

export async function login(password: string): Promise<string | number> {
	let credentials = new kdbx.Credentials(kdbx.ProtectedValue.fromString(password));
	return fs.promises.readFile(getConfig().filePath)
		
		.then((data) => kdbx.Kdbx.load(toArrayBuffer(data), credentials).then((db) => {
			var token = randomBytes(200).toString("hex");
			registerToken(db, token);
			return token;
		})
		.catch((reason) => {
			info("Wrong password");
			console.log("Reason", reason);
			return 401;
		}))
		.catch((err) => {
			error("Internal error : " + err);
			return 500;
		})
}

//the current entries, because the deleted entries are still visible
function notTrashIterator(): kdbx.KdbxEntry[] {
	let array = []
	for(const entry of base.getDefaultGroup().allEntries()){
		if(entry.parentGroup != base.getGroup(base.meta.recycleBinUuid)){
			array.push(entry);
		}
	}
	return array;
}

export function getEntriesByName(name: string): KdbxPartEntry[] {
	return notTrashIterator().filter((entry) => title(entry).toLowerCase().includes(name)).map((entry) => ({ name: title(entry), id: entry.uuid.id }));
}

/*function requestEntry(request: EntryRequest, res: any) {
	if (request.code == 0) {
		let array: KdbxPartEntry[] = [];
		for (const entry of notTrashIterator()) {
			let name = title(entry);
			if (name.toLowerCase().includes(request.name)) {
				array.push({ name: name, id: entry.uuid.id });
			}
		}
		res.json({ output: array });
	} else {
		let array: KdbxPartEntry[] = [];
		for (const entry of notTrashIterator()) {
			let u = url(entry);
			if (u.toLowerCase().includes(request.url)) {
				let ent: KdbxPartEntry = { id: entry.uuid.id, name: title(entry) };
				if (request.code & 1) {
					ent.username = username(entry);
				}
				if (request.code & 2) {
					ent.pwHash = encrypt(password(entry), config.token);
				}
				array.push(ent);
			}
		}
		res.json({ output: array });
	}
}*/