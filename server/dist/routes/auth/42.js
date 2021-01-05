"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const token_1 = __importStar(require("../../utils/token"));
exports.default = [
    passport_1.default.authenticate('42', {
        session: false
    }),
    function (req, res) {
        if (req.user != undefined) {
            const account = req.user;
            const token = token_1.default.sign({
                id: account.id
            }, token_1.TokenType.SESSION, {
                expiresIn: '7d'
            });
            return res.render('oauth', {
                account,
                token: token.encoded,
                origin: process.env.FRONT_URL
            });
        }
        return res.status(302).end();
    }
];
