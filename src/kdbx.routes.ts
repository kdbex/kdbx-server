import { decrypt, encrypt } from "./util/crypt";
import { getConfig } from "./util/file";
import {error, info} from "./util/logger";
import * as kdbx from "kdbxweb";
import fs from "fs";
import { EntryCreation, EntryUpdate, KdbxPartEntry, SetupVerification } from "./model";
import { randomBytes } from "crypto";
import { base, registerToken } from "./app";

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

export function getEntriesForUrl(filledUrl: string, code: number): KdbxPartEntry[] {
	return notTrashIterator().filter((entry) => url(entry).toLowerCase().includes(filledUrl)).map((entry) => {
		let out: KdbxPartEntry = { name: title(entry), id: entry.uuid.id };
		if (code & 1) {
			out.username = username(entry);
		}
		if (code & 2) {
			out.pwHash = encrypt(password(entry), getConfig().token);
		}
		return out;
	});
}

export function createEntry(request: EntryCreation): KdbxPartEntry | boolean {
	let entry = base.createEntry(base.getDefaultGroup());
	entry.fields.set("URL", request.url);
	entry.fields.set("UserName", request.username);
	entry.fields.set("Password", kdbx.ProtectedValue.fromString(decrypt(request.pwHash, getConfig().token)));
	entry.fields.set("Title", request.name);
	base.save().then((ab) => {
		fs.writeFile(getConfig().filePath, Buffer.from(ab), (err) => {
			if (err) {
				error("Error during file writing : " + err);
				return true;
			}
			info("File saved !");
		});
	}, (rej) => {
		error("Error during kdbx base saving : " + rej);
		return true;
	});
	return { id: entry.uuid.id, name: title(entry)};
}

export function updateEntry(update: EntryUpdate): boolean {
	for (let entry of base.getDefaultGroup().allEntries()) {
		if (entry.uuid.id == update.id) {
			info("Entry updating : " + title(entry));
			entry.fields.set("URL", update.url);
			base.save().then((ab) => {
				fs.writeFile(getConfig().filePath, Buffer.from(ab), (err) => {
					if (err) {
						error("Error during entry updating: " + err)
						return false;
					}
				});
			});
			return true;
		}
	}
}

export function generatePassword(): string {
	const lowCase = "abcdefghijklmnopqrstuvxyz";
	const upCase = "ABCDEFGHIJKLMNOPQRSTUVXYZ";
	const numbers = "0123456789";
	const spec = "£$&()*+[]@#^-_!?";
	const arrays = [lowCase, upCase, numbers, spec];
	let size = 20;
	let pw = "";
	for (let i = 0; i < size; i++) {
		let arr = arrays[Math.floor(arrays.length * Math.random())];
		pw += arr.charAt(Math.floor(arr.length * Math.random()));
	}
	return pw;
}