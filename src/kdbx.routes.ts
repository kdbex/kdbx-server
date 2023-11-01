import { SetupVerification } from "./model";
import { decrypt, getConfig } from "./util";
import {info} from "./util/logger";

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