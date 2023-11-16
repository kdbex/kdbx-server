import { Router, Request, Response } from "express";
import {getEntriesByName, getEntriesForUrl, login, setup} from "./kdbx.routes";
import { decrypt } from "./util/crypt";
import { getConfig } from "./util/file";

/**
 * Express router for handling KDBX server routes
 * @class
 */
let router = Router();

/**
 * Verifies if the token has been correctly filled on the client side
 * @openapi
 * /setup:
 *   get:
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
router.get('/setup', (req: Request, res: Response) => {
    res.json(setup(req.body));
});

/**
 * Tries to login with the file password hash
 * @openapi
 * /login:
 *   post:
 *      description: Tries to login with the file password hash
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: string
 *                      description: The password hash
 *      responses:
 *          200:
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: string
 *              description: The token to communicate through this session
 *          401:
 *              description: If a wrong password has been given
 *          500:
 *              description: If a server error has occured
 */
router.post('/login', async (req: Request, res: Response) => {
    console.log(req.body);
    await login(decrypt(req.body.key as string, getConfig().token)).then((value) => {
        if (typeof value == 'number') {
            res.sendStatus(value);
        }else{
            res.send(value);
        }
    })
})

/**
 * Returns all the entries where the name parameter is contained inside the entry's title.
 * @openapi
 * /entries/name/{name}:
 *   get:
 *      description: Returns all the entries where the name parameter is contained inside the entry's title. 
 *      parameters:
 *      - name: name
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: A string part of an entry title
 *      responses:
 *        200:
 *          description: The array of entries where the name parameter is contained inside the entry's title.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/KdbxPartEntry'
 */
router.get('/entries/name/:name', (req: Request, res: Response) => {
    res.send(getEntriesByName((req.params.name as string).toLowerCase()))
});

/**
 * Returns all the entries for a given URL and code
 * @openapi
 * /entries/url/{url}/{code}:
 *   get:
 *      description: Returns all the entries for a given URL and code
 *      parameters:
 *      - name: url
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The URL to search for
 *      - name: code
 *        in: path
 *        required: true
 *        schema:
 *          type: number
 *        description: Indicates whether we respond with usernamme and password, code & 1 for username, code & 2 for password
 *      responses:
 *        200:
 *          description: The array of entries for the given URL and code
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/KdbxPartEntry'
 */
router.get('/entries/url/:url/:code', (req: Request, res: Response) => {
    res.send(getEntriesForUrl((req.params.url as string).toLowerCase(), req.params.code as unknown as number))
});

export default router;