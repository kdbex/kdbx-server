import { Router, Request, Response } from "express";

let router = Router();

router.get('/hello', (req: Request, res: Response) => {
    res.send("HIII");
});

router.get('/open', (req: Request, res: Response) => {
    res.send("open");
});

export default router;