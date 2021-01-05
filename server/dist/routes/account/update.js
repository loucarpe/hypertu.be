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
const Account_1 = require("../../database/Account");
const consts_1 = require("../../utils/consts");
const token_1 = __importStar(require("../../utils/token"));
exports.default = [
    express_validator_1.body('email')
        .isEmail()
        .withMessage('must be an email')
        .optional(),
    express_validator_1.body('username')
        .matches(consts_1.USERNAME_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.USERNAME_REGEX.source}`)
        .optional(),
    express_validator_1.body('password')
        .matches(consts_1.PWD_REGEX)
        .withMessage(`doesn't math with regex: ${consts_1.PWD_REGEX.source}`)
        .optional(),
    express_validator_1.body('firstname')
        .isAlpha('fr-FR')
        .withMessage('must be string with only alpha chars')
        .optional(),
    express_validator_1.body('lastname')
        .isAlpha('fr-FR')
        .withMessage('must be string with only alpha chars')
        .optional(),
    express_validator_1.body('avatar')
        .isURL({ require_tld: false })
        .withMessage('must be an URL')
        .optional(),
    express_validator_1.body('language')
        .isIn(consts_1.AVAILABLE_LANGUAGES.map(lang => lang.iso))
        .withMessage(`must be one of [${consts_1.AVAILABLE_LANGUAGES.map(lang => lang.iso)}]`)
        .optional(),
    token_1.default.header(token_1.TokenType.SESSION),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            // Clean unknown keys
            for (let key in req.body) {
                if (!Object.keys(Account_1.AccountSchema.obj).includes(key)) {
                    delete req.body[key];
                }
            }
            if (req.body.password != undefined) {
                req.body.password = yield bcrypt_1.default.hash(req.body.password, parseInt(process.env.BCRYPT_SALT));
            }
            try {
                if (req.body.email != undefined) {
                    let reqEmail = yield Account_1.Accounts.findOne({ email: req.body.email }).exec();
                    if (reqEmail != undefined && reqEmail.id != req.token.decoded.id) {
                        return res.status(409).json({
                            key: 'email',
                            error: `'email' already used by another account`
                        });
                    }
                }
            }
            catch (error) {
                return res.status(500).end();
            }
            try {
                if (req.body.username != undefined) {
                    let reqUsername = yield Account_1.Accounts.findOne({ username: req.body.username }).exec();
                    if (reqUsername != undefined && reqUsername.id != req.token.decoded.id) {
                        return res.status(409).json({
                            key: 'username',
                            error: `'username' already used by another account`
                        });
                    }
                }
            }
            catch (error) {
                return res.status(500).end();
            }
            try {
                yield Account_1.Accounts.findByIdAndUpdate(req.token.decoded.id, req.body).exec();
                return res.status(200).end();
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
];
