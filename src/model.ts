export interface LoginResponse {
	status: boolean;
	token?: JsonBuffer;
	message?: string;
}

export interface KdbxPartEntry {
	id: string;
	name: string;
	pwHash?: string;
	username?: string;
	password?: string;
}

export interface EntryRequest {
	token: JsonBuffer;
	code: number;
	url?: string;
	name?: string;
}

export interface EntryCreation {
	token: JsonBuffer;
	name: string;
	pwHash: string;
	username: string;
	url: string;
}

export interface EntryUpdate {
	token: JsonBuffer;
	id: string;
	url: string;
}

export interface JsonBuffer {
	type: "Buffer";
	data: number[];
}

/**
 * @openapi
 * components:
 *   schemas:
 *     SetupVerification:
 *       type: object
 *       required:
 *         - message
 *         - hash
 *       properties:
 *         message:
 *           type: string
 *           description: A message to test.
 *         hash:
 *           type: string
 *           description: The message hash through the token.
 */
export interface SetupVerification {
	message: string;
	hash: string;
}
