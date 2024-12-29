"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashMiddleware = void 0;
function flashMiddleware(req, res, next) {
    res.locals.message = req.session.message || { type: '', message: '' };
    delete req.session.message;
    next();
}
exports.flashMiddleware = flashMiddleware;
