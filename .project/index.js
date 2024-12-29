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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const session_1 = __importDefault(require("./session"));
const secureMiddleware_1 = require("./secureMiddleware");
const flashMiddleware_1 = require("./flashMiddleware");
const mongo_1 = require("./mongo");
const loginRouter_1 = require("./routes/loginRouter");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.static("public"));
app.set("view engine", "ejs");
app.set("port", PORT);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.set('views', path_1.default.join(__dirname, "views"));
app.use('/login', (0, loginRouter_1.loginRouter)());
app.use(session_1.default);
app.use(flashMiddleware_1.flashMiddleware);
//---------------------------------------------------------LOGIN
app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    try {
        let user = yield (0, mongo_1.login)(email, password);
        delete user.password;
        req.session.user = user;
        res.redirect("/");
    }
    catch (e) {
        req.session.message = { type: "error", message: e.message };
        res.redirect("/login");
    }
}));
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/login");
    });
});
//---------------------------------------------------------------------------------------------------- CHARACTERS ROUTES
app.get("/", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : "";
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "Names";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
        const characters = yield (0, mongo_1.getCharacters)();
        console.log("Fetched characters for route:", characters);
        let filteredCharacters = characters.filter(character => character.Names.toLowerCase().includes(q.toLowerCase()));
        let sortedCharacters = filteredCharacters.sort((a, b) => {
            if (sortField === "Names") {
                return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
            }
            else if (sortField === "Age") {
                return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
            }
            return 0;
        });
        console.log("Filtered and sorted characters:", sortedCharacters);
        res.render("index", {
            persons: sortedCharacters,
            sortField,
            sortDirection,
            q,
            user: req.session.user || null
        });
    }
    catch (error) {
        console.error("Error fetching characters:", error);
        res.status(500).send("Error fetching characters");
    }
}));
app.get("/characters", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : "";
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "Names";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
        const characters = yield (0, mongo_1.getCharacters)();
        console.log("Fetched characters for route:", characters);
        let filteredCharacters = characters.filter(character => character.Names.toLowerCase().includes(q.toLowerCase()));
        let sortedCharacters = filteredCharacters.sort((a, b) => {
            if (sortField === "Names") {
                return sortDirection === "asc" ? a.Names.localeCompare(b.Names) : b.Names.localeCompare(a.Names);
            }
            else if (sortField === "Age") {
                return sortDirection === "asc" ? a.Age - b.Age : b.Age - a.Age;
            }
            return 0;
        });
        console.log("Filtered and sorted characters:", sortedCharacters);
        res.render("characters", {
            characters: sortedCharacters,
            sortField,
            sortDirection,
            q
        });
    }
    catch (error) {
        console.error("Error fetching characters:", error);
        res.status(500).send("Error fetching characters");
    }
}));
app.get("/characters/:id", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const characters = yield (0, mongo_1.getCharacters)();
        const character = characters.find(c => c.ID === req.params.id);
        if (character) {
            res.render("character-detail", { character: character });
        }
        else {
            res.status(404).send("Character not found");
        }
    }
    catch (error) {
        console.error("Error fetching character:", error);
        res.status(500).send("Error fetching character");
    }
}));
//---------------------------------------------------------------------------------------------------- WEAPONS ROUTES
app.get('/weapons', secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const characters = yield (0, mongo_1.getCharacters)();
        const weapons = characters.flatMap(character => character.Weapons);
        const q = typeof req.query.q === 'string' ? req.query.q : "";
        const filteredWeapons = weapons.filter(weapon => weapon.weapon_name.toLowerCase().includes(q.toLowerCase()));
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "weapon_name";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
        const sortedWeapons = filteredWeapons.sort((a, b) => {
            if (sortField === "weapon_name") {
                return sortDirection === "asc" ? a.weapon_name.localeCompare(b.weapon_name) : b.weapon_name.localeCompare(a.weapon_name);
            }
            else if (sortField === "weapon_power") {
                return sortDirection === "asc" ? a.weapon_power - b.weapon_power : b.weapon_power - a.weapon_power;
            }
            return 0;
        });
        res.render("weapons", {
            weapons: sortedWeapons,
            sortField: sortField,
            sortDirection: sortDirection,
            q: q
        });
    }
    catch (error) {
        console.error("Error fetching weapons:", error);
        res.status(500).send("Error fetching weapons");
    }
}));
app.get("/weapons-detail/:weapon_id", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const characters = yield (0, mongo_1.getCharacters)();
        const weapons = characters.flatMap(character => character.Weapons);
        const weapon = weapons.find(w => w.weapon_id === req.params.weapon_id);
        if (weapon) {
            res.render("weapons-detail", { weapon: weapon });
        }
        else {
            res.status(404).send("Weapon not found");
        }
    }
    catch (error) {
        console.error("Error fetching weapon:", error);
        res.status(500).send("Error fetching weapon");
    }
}));
//---------------------------------------------------------------------------------------------------- CRUD CHARACTERS ROUTES
app.post("/characters/:id/delete", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const characterId = req.params.id;
    try {
        yield (0, mongo_1.deleteCharacter)(characterId);
        res.redirect("/characters");
    }
    catch (error) {
        console.error("Error deleting character:", error);
        res.status(500).send("Error deleting character");
    }
}));
app.get("/characters/:id/update", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const characters = yield (0, mongo_1.getCharacters)();
        const character = characters.find(c => c.ID === req.params.id);
        if (character) {
            res.render("update", { character: character });
        }
        else {
            res.status(404).send("Character not found");
        }
    }
    catch (error) {
        console.error("Error fetching character:", error);
        res.status(500).send("Error fetching character");
    }
}));
app.post("/characters/:id/update", secureMiddleware_1.secureMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const characterId = req.params.id;
    const updatedCharacter = req.body;
    try {
        yield (0, mongo_1.updateCharacter)(characterId, updatedCharacter);
        res.redirect("/characters");
    }
    catch (error) {
        console.error("Error updating character:", error);
        res.status(500).send("Error updating character");
    }
}));
//---------------------------------------------------------------------------------------------------- DATABASE CONNECTION
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongo_1.connect)();
    console.log(`Server is running on port ${PORT}`);
}));
exports.default = app;
