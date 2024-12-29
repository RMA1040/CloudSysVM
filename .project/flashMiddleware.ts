import { Request, Response, NextFunction } from "express";

export function flashMiddleware(req: Request, res: Response, next: NextFunction) {
    res.locals.message = req.session.message || { type: '', message: '' };
    delete req.session.message;
    next();
}
