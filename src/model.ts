/**
 * @openapi
 * components:
 *  schemas:
 *    KdbexEntryInfo:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The ID of the entry.
 *        name:
 *          type: string
 *          description: The name of the entry.
 */
export interface KdbexEntryInfo {
	id: string;
	name: string;
	passwordHash?: string;
	username?: string;
}

/**
 * @openapi
 * components:
 *  schemas:
 *    KdbexEntry:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The ID of the entry.
 *        name:
 *          type: string
 *          description: The name of the entry.
 *        passwordHash:
 *          type: string
 *          description: The password hash of the entry.
 *        username:
 *          type: string
 *          description: The username of the entry.
 */
export interface KdbexEntry {
	id: string;
	name: string;
	passwordHash?: string;
	username?: string;
}

/**
 * @openapi
 * components:
 *  schemas:
 *    KdbexEntryStore:
 *      type: object
 *      properties:
 *        name:
 *          type: string
 *          description: The name of the entry.
 *        pwHash:
 *          type: string
 *          description: The hashed password.
 *        username:
 *          type: string
 *          description: The username of the entry.
 *        url:
 *          type: string
 *          description: The url of the entry.
 *        uuid:
 *          type: string
 *          description: The uuid of the entry to update, else undefined.
 *        faviconUrl:
 *          type: string
 *          description: The favicon url of the entry.
 */
export interface KdbexEntryStore {
	name: string;
	pwHash: string;
	username: string;
	url: string;
	uuid: string | undefined;
	faviconUrl: string;
}

/**
 * Represents a setup verification request.
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