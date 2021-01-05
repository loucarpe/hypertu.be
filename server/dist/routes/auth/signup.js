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
const express_validator_1 = require("express-validator");
const mongodb_1 = require("mongodb");
const bcrypt_1 = __importDefault(require("bcrypt"));
const consts_1 = require("../../utils/consts");
const Account_1 = require("../../database/Account");
exports.default = [
    express_validator_1.body('email')
        .isEmail()
        .withMessage('must be an email'),
    express_validator_1.body('username')
        .matches(consts_1.USERNAME_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.USERNAME_REGEX.source}`),
    express_validator_1.body('password')
        .matches(consts_1.PWD_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.PWD_REGEX.source}`),
    express_validator_1.body('firstname')
        .matches(consts_1.NAME_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.NAME_REGEX.source}`),
    express_validator_1.body('lastname')
        .matches(consts_1.NAME_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.NAME_REGEX.source}`),
    express_validator_1.body('avatar')
        .isURL({ require_tld: false })
        .withMessage('must be an URL'),
    express_validator_1.body('language')
        .isIn(consts_1.AVAILABLE_LANGUAGES.map(lang => lang.iso))
        .withMessage(`must be one of [${consts_1.AVAILABLE_LANGUAGES.map(lang => lang.iso)}]`)
        .optional(),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            const password = yield bcrypt_1.default.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
            try {
                yield new Account_1.Accounts(Object.assign({
                    email: req.body.email,
                    username: req.body.username,
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    avatar: req.body.avatar,
                    password
                }, req.body.language ? { language: req.body.language } : {})).save();
                return res.status(201).end();
            }
            catch (ex) {
                if (ex instanceof mongodb_1.MongoError) {
                    if (ex.code === 11000) {
                        const key = ex.errmsg.includes('username') ? 'username' : 'email';
                        return res.status(409).json({
                            key: key,
                            error: `'${key}' already used by another account`
                        });
                    }
                    return res.status(520).json({
                        error: ex.errmsg
                    });
                }
                return res.status(500).end();
            }
        });
    }
];
