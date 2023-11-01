import { AES, enc } from "crypto-js";
import fs from "fs";
import path from "path";

export function encrypt(message: string, key: string): string {
	const encrypt = AES.encrypt(message, key);
	return encrypt.toString();
}

export function decrypt(hash: string, key: string): string {
	let bytes = AES.decrypt(hash, key);
	return bytes.toString(enc.Utf8);
}

export interface Config {
    filePath: string;
    port: number;
    token: string;
}

var config: Config = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "config.json"), "utf-8"));

export function getConfig() {
    return config;
}

