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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importStar(require("../../utils/token"));
const Account_1 = require("../../database/Account");
const consts_1 = require("../../utils/consts");
exports.default = [
    express_validator_1.body('new_password')
        .matches(consts_1.PWD_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.PWD_REGEX.source}`),
    token_1.default.body('token', token_1.TokenType.RESET_PASSWORD),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            try {
                yield Account_1.Accounts.findByIdAndUpdate(req.token.decoded.id, {
                    password: yield bcrypt_1.default.hash(req.body.new_password, parseInt(process.env.BCRYPT_SALT))
                }).exec();
                return res.status(200).end();
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
];
