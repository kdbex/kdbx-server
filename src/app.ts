import express from "express";
import fs from "fs";
import { EntryCreation, EntryRequest, EntryUpdate, KdbxPartEntry, LoginResponse, SetupVerification } from "./model";
import { AES, enc } from "crypto-js";
import cors from "cors";
import bodyParser from "body-parser";
import * as kdbx from "kdbxweb";
import { Kdbx } from "kdbxweb";
import { randomBytes } from "crypto";
import path from "path";
import process from "process";
import router from "./router";
import auth from './auth';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { checkFolder, getConfig } from "./util/file";
import { info } from "./util/logger";
import { encrypt } from "./util/crypt";
/*

var base: Kdbx;
var loginToken: Buffer;

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

function toArrayBuffer(buf: Buffer) {
	const ab = new ArrayBuffer(buf.length);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

function login(hash: any, res: any) {
	let password = decrypt(hash, config.token);
	let credentials = new kdbx.Credentials(kdbx.ProtectedValue.fromString(password));
	console.log("Logging in", config.filePath);
	fs.readFile(config.filePath, (err, data) => {
		if (err == null) {
			kdbx.Kdbx.load(toArrayBuffer(data), credentials)
				.then((db) => {
					base = db;
					var token = randomBytes(128);
					loginToken = token;
					var msg: LoginResponse = { token: token.toJSON(), status: true };
					res.json(msg);
				})
				.catch((reason) => {
					info("Wrong password");
					console.log("Reason", reason);
					res.json({ message: "Wrong password", status: false });
				});
		} else {
			error("Internal error : " + err);
			res.json({ message: "Internal error", status: false });
		}
	});
}

function notTrashIterator(): kdbx.KdbxEntry[] {
	let array = []
	for(const entry of base.getDefaultGroup().allEntries()){
		if(entry.parentGroup != base.getGroup(base.meta.recycleBinUuid)){
			array.push(entry);
		}
	}
	return array;
}

function requestEntry(request: EntryRequest, res: any) {
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
}

function createEntry(request: EntryCreation, res: any) {
	let entry = base.createEntry(base.getDefaultGroup());
	entry.fields.set("URL", request.url);
	entry.fields.set("UserName", request.username);
	entry.fields.set("Password", kdbx.ProtectedValue.fromString(decrypt(request.pwHash, config.token)));
	entry.fields.set("Title", request.name);
	base.save().then((ab) => {
		fs.writeFile(config.filePath, Buffer.from(ab), (err) => {
			if (err) {
				error("Error : " + err);
				res.status(500).json();
				return;
			}
			info("File saved !");
		});
	}, (rej) => {
		console.log(rej);
	});
	res.json({ id: entry.uuid.id, name: title(entry), username: username(entry), password: password(entry) });
}

function updateEntry(update: EntryUpdate, res: any) {
	for (let entry of base.getDefaultGroup().allEntries()) {
		if (entry.uuid.id == update.id) {
			info("Entry updating : " + title(entry));
			entry.fields.set("URL", update.url);
			base.save().then((ab) => {
				fs.writeFile(config.filePath, Buffer.from(ab), (err) => {
					if (err) {
						res.status(500).json({});
						return;
					}
				});
			});
			res.status(200).json({});
			return;
		}
	}
}

function generatePassword(): string {
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
	return encrypt(pw, config.token);
}

const app = express();
const port = config.port;
app.use(cors());
if(process.argv.includes("--dev")){

}

app.listen(port, () => {
	info(`server is listening on ${port}`);
});

app.post("/kdbxchrome/login", bodyParser.json(), (req, res) => {
	try {
		var password = req.body.password;
		login(password, res);
	} catch (e) {
		error(`Catched an error during login : ${e}`)
	}
});
app.post("/kdbxchrome/getentries", bodyParser.json(), (req, res) => {
	try {
		var request: EntryRequest = req.body;
		let token: Buffer = Buffer.from(request.token.data);
		if (!loginToken.equals(Buffer.from(token))) {
			res.status(500).json();
		}
		info("Received request for getentries: " + request.code + " " + request.url);
		requestEntry(request, res);
	} catch (e) {
		error(`Catched an error during getentries : ${e}`);
	}
});

app.post("/kdbxchrome/createentry", bodyParser.json(), (req, res) => {
	try {
		var request: EntryCreation = req.body;
		let token: Buffer = Buffer.from(request.token.data);
		if (!loginToken.equals(Buffer.from(token))) {
			res.status(500).json();
		}
		info("Adding entry " + request.name);
		createEntry(request, res);
	} catch (e) {
		error(`Catched an error during createentry : ${e}`);
	}
});

app.post("/kdbxchrome/updateurl", bodyParser.json(), (req, res) => {
	var request: EntryUpdate = req.body;
	let token: Buffer = Buffer.from(request.token.data);
	if (!loginToken.equals(Buffer.from(token))) {
		res.status(500).json();
	}
	info("Updating entry : " + request.url + " / " + request.id);
	try {
		updateEntry(request, res);
	} catch (e) {
		error(e);
	}
});

app.post("/kdbxchrome/setup", bodyParser.json(), (req, res) => {
	let request: SetupVerification = req.body;
	let cmp = request.message == decrypt(request.hash, config.token);
	if (cmp) {
		info("Setup has been done correctly, token is ok");
	}
	res.json(cmp);
});

app.post("/kdbxchrome/genpassword", bodyParser.json(), (req, res) => res.status(200).json({ pw: generatePassword() }));

function encrypt(message: string, key: string): string {
	const encrypt = AES.encrypt(message, key);
	return encrypt.toString();
}

function decrypt(hash: string, key: string): string {
	let bytes = AES.decrypt(hash, key);
	return bytes.toString(enc.Utf8);
}
*/

let config: {port: string, filePath: string, token: string} = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config.json"), "utf-8"));

const swaggerSpec = swaggerJSDoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'KdbxServer',
			version: '1.0.0'
		}
	},
	apis: ['./src/kdbx.routes.ts', './src/auth.ts']
});
checkFolder();
const app = express();
const port = getConfig().port;

export var base: Kdbx;
export var loginToken: Buffer;

export function registerToken(b: Kdbx, token: Buffer) {
	base = b;
	loginToken = token;
}

app.use(cors())
	.use(bodyParser.json())
	.use(auth)
	.use(router)
	.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerSpec)).listen(port, () => {
	info(`Server successfuly started on ${port}`);
})