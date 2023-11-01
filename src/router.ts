import { Router, Request, Response } from "express";
import {setup} from "./kdbx.routes";
let router = Router();

router.get('/setup', (req: Request, res: Response) => {
    res.json(setup(req.body));
});

export default router;