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
 *        pwHash:
 *          type: string
 *          description: The password hash of the entry.
 *        username:
 *          type: string
 *          description: The username of the entry.
 */
export interface KdbexEntry {
	id: string;
	name: string;
	pwHash?: string;
	username?: string;
}

/**
 * @openapi
 * components:
 *  schemas:
 *    EntryCreation:
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
 */
export interface EntryCreation {
	name: string;
	pwHash: string;
	username: string;
	url: string;
}

/**
 * @openapi
 * components:
 *  schemas:
 *    EntryUpdate:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: The id of the entry.
 *        url:
 *          type: string
 *          description: The url of the entry.
 */
export interface EntryUpdate {
	id: string;
	url: string;
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
