import { Router, Request, Response } from "express";
import {createEntry, generatePassword, getEntriesForName, getEntriesForUrl, getEntry, login, setup, updateEntry} from "./kdbx.routes";
import { decrypt, encrypt } from "./util/crypt";
import { getConfig } from "./util/config";

/**
 * Express router for handling KDBX server routes
 * @class
 */
let router = Router();

/**
 * Verifies if the token has been correctly filled on the client side
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
router.post('/setup', (req: Request, res: Response) => {
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
 *                      type: object
 *                      properties:
 *                          key:
 *                              type: string
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
    await login(decrypt(req.body.key as string, getConfig().cryptKey)).then((value) => {
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
 *                  $ref: '#/components/schemas/KdbexEntryInfo'
 */
router.get('/entries/name/:name', (req: Request, res: Response) => {
    res.send(getEntriesForName((req.params.name as string).toLowerCase()))
});

/**
 * Returns all the entries for a given URL and code
 * @openapi
 * /entries/url/{url}:
 *   get:
 *      description: Returns all the entries for a given URL and code
 *      parameters:
 *      - name: url
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The URL to search for
 *      responses:
 *        200:
 *          description: The array of entries for the given URL and code
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/KdbexEntryInfo'
 */
router.get('/entries/url/:url', (req: Request, res: Response) => {
    res.send(getEntriesForUrl((req.params.url as string).toLowerCase()))
});

/**
 * Returns all the entries for a given URL and code
 * @openapi
 * /entries/id/{id}/{code}:
 *   get:
 *      description: Returns all the entries for a given URL and code
 *      parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The id of the entry
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
 *                  $ref: '#/components/schemas/KdbexEntry'
 *        404:
 *          description: If the id matches no entry      
 */
router.get('/entries/id/:id', (req: Request, res: Response) => {
    const entry = getEntry((req.params.url as string).toLowerCase(), req.params.code as unknown as number)
    if(entry) {
        res.send(entry)
    } else {
        res.sendStatus(404)
    }
});

/**
 * @openapi
 * /entries/create:
 *   post:
 *      description: Creates a new entry
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/KdbexEntryStore'
 *      responses:
 *          200:
 *              description: The created entry
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/KdbexEntry'
 *          500:
 *              description: If a server error has occurred
 */
router.post('/entries/create', (req: Request, res: Response) => {
    createEntry(req.body).then((entry) => {
        if (typeof entry == 'boolean') {
            res.sendStatus(500);
        }else{
            res.send(entry);
        }
    });
});

/**
 * @openapi
 * /entries/update:
 *   post:
 *      description: Updates an existing entry
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/KdbexEntryStore'
 *      responses:
 *          200:
 *              description: If the entry was updated successfully
 *          500:
 *              description: If a server error has occurred
 */
router.post('/entries/update', (req: Request, res: Response) => {
    updateEntry(req.body).then((b) => b ? res.sendStatus(200) : res.sendStatus(500));
});

export default router;