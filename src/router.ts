import { Router, Request, Response } from "express";
import {login, setup} from "./kdbx.routes";
import { decrypt } from "./util/crypt";
import { getConfig } from "./util/file";
let router = Router();

router.get('/setup', (req: Request, res: Response) => {
    res.json(setup(req.body));
});

router.post('/login', async (req: Request, res: Response) => {
    res.json(await login(decrypt(req.body.password as string, getConfig().token)));
})

export default router;