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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importStar(require("../../../utils/token"));
const Account_1 = require("../../../database/Account");
exports.default = [
    token_1.default.body('token', token_1.TokenType.ACTIVATE_ACCOUNT),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Account_1.Accounts.findByIdAndUpdate(req.token.decoded.id, { verified: true }).exec();
                return res.status(200).end();
            }
            catch (error) {
                return res.status(500).end();
            }
        });
    }
];
