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
const validator_1 = __importDefault(require("validator"));
const token_1 = __importStar(require("../../utils/token"));
const Account_1 = require("../../database/Account");
const mailer_1 = require("../../utils/mailer");
exports.default = [
    express_validator_1.body('login')
        .isString()
        .withMessage('must be a string'),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            try {
                const isEmail = validator_1.default.isEmail(req.body.login);
                const query = isEmail
                    ? {
                        email: req.body.login,
                        authProvider: 'local'
                    }
                    : {
                        username: req.body.login,
                        authProvider: 'local'
                    };
                const account = yield Account_1.Accounts.findOne(query).exec();
                if (account != null) {
                    const token = token_1.default.sign({ id: account.id }, token_1.TokenType.RESET_PASSWORD, { expiresIn: '2h' });
                    const mail = new mailer_1.Mail('reset-password', account.email, 'Reset your password');
                    mail.send({
                        username: account.username,
                        url: `${process.env.FRONT_URL}/resetpwd?token=${token.encoded}`
                    });
                }
                return res.status(202).end();
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
];
