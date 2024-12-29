"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const mongo_1 = require("../mongo");
const express_1 = __importDefault(require("express"));
const secureMiddleware_1 = require("../secureMiddleware");
function loginRouter() {
    const router = express_1.default.Router();
    router.get("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.render("login");
    }));
    router.post("/login", (req, res) => __awaiter(this, void 0, void 0, function* () {
        const email = req.body.email;
        const password = req.body.password;
        try {
            let user = yield (0, mongo_1.login)(email, password);
            delete user.password;
            req.session.user = user;
            res.redirect("/");
        }
        catch (e) {
            res.redirect("/login");
        }
    }));
    router.post("/logout", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
        req.session.destroy((err) => {
            res.redirect("/login");
        });
    }));
    return router;
}
exports.loginRouter = loginRouter;
