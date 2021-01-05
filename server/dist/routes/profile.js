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
const express_validator_1 = require("express-validator");
const token_1 = __importStar(require("../utils/token"));
const Account_1 = require("../database/Account");
const account_1 = require("../utils/account");
exports.default = [
    express_validator_1.param('username')
        .isString()
        .withMessage('must be a string'),
    token_1.default.header(token_1.TokenType.SESSION),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            try {
                const account = yield Account_1.Accounts.findOne({ username: req.params.username }).exec();
                if (!account) {
                    return res.status(404).json({
                        error: {
                            code: 'ACCOUNT_NOT_FOUND',
                            msg: 'profile not found'
                        }
                    });
                }
                let obj = account.toObject();
                delete obj.password;
                delete obj.email;
                obj.watchlist = yield account_1.populateWatchlist(account);
                return res.status(200).json(obj);
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
];
