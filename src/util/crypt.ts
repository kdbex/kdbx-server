/**
 * Crypting file to encrypt and decrypt files
 */
import { AES, enc } from "crypto-js";

export function encrypt(message: string, key: string): string {
	const encrypt = AES.encrypt(message, key);
	return encrypt.toString();
}

export function decrypt(hash: string, key: string): string {
	let bytes = AES.decrypt(hash, key);
	return bytes.toString(enc.Utf8);
}