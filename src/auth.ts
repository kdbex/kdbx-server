import { NextFunction, Request, Response, Router } from "express";
import { unless } from "express-unless";
import { loginToken } from "./app";

let router = Router();

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token || token != loginToken) {
        res.status(401).send('Unauthorized: No token provided');
        return;
    }
    next();
};
checkAuth.unless = unless;

router.use(checkAuth.unless({ path: ['/login', '/setup', /^\/docs\/.*/] }));



export default router;