/**
 * Represents a login response.
 * @remarks
 * This interface is used to represent the response of a login request.
 */
export interface LoginResponse {
	status: boolean;
	token?: string;
	message?: string;
}

/**
 * @openapi
 * components:
 *  schemas:
 *    KdbxPartEntry:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The ID of the entry.
 *        name:
 *          type: string
 *          description: The name of the entry.
 *        pwHash:
 *          type: string
 *          description: The password hash of the entry.
 *        username:
 *          type: string
 *          description: The username of the entry.
 *        password:
 *          type: string
 *          description: The password of the entry.
 */
export interface KdbxPartEntry {
	id: string;
	name: string;
	pwHash?: string;
	username?: string;
	password?: string;
}

/**
 * Represents an entry request.
 * @remarks
 * This interface is used to represent a request for a KDBX entry.
 */
export interface EntryRequest {
	token: JsonBuffer;
	code: number;
	url?: string;
	name?: string;
}

/**
 * Represents an entry creation request.
 * @remarks
 * This interface is used to represent a request to create a new KDBX entry.
 */
export interface EntryCreation {
	token: JsonBuffer;
	name: string;
	pwHash: string;
	username: string;
	url: string;
}

/**
 * Represents an entry update request.
 * @remarks
 * This interface is used to represent a request to update an existing KDBX entry.
 */
export interface EntryUpdate {
	token: JsonBuffer;
	id: string;
	url: string;
}

/**
 * Represents a JSON buffer.
 * @remarks
 * This interface is used to represent a JSON buffer, which is a binary representation of a JSON object.
 */
export interface JsonBuffer {
	type: "Buffer";
	data: number[];
}

/**
 * Represents a setup verification request.
 * @remarks
 * This interface is used to represent a request to verify a setup.
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
