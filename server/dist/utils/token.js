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
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const Account_1 = require("../database/Account");
class Token {
    constructor(decoded, encoded) {
        this.decoded = decoded;
        this.encoded = encoded;
    }
    static extractAccount(fields) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                let query = Account_1.Accounts.findById(req.token.decoded.id);
                if (fields != undefined) {
                    query = query.select(fields.join(' '));
                }
                const account = yield query.exec();
                if (!account) {
                    return res.status(404).json({
                        error: {
                            code: 'ACCOUNT_NOT_FOUND',
                            msg: 'account not found, token is probably expired'
                        }
                    });
                }
                req.account = account;
                next();
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
    static verify(encoded, type, options) {
        try {
            let decoded = jsonwebtoken_1.default.verify(encoded, process.env.JWT_SECRET, options);
            if (decoded.type !== type) {
                throw new InvalidTokenError();
            }
            return new Token(decoded, encoded);
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError)
                throw new ExpiredTokenError();
            else
                throw new InvalidTokenError();
        }
    }
    static sign(decoded, type, options) {
        try {
            let encoded = jsonwebtoken_1.default.sign(Object.assign(Object.assign({}, decoded), { type }), process.env.JWT_SECRET, options);
            return new Token(decoded, encoded);
        }
        catch (err) {
            throw new InvalidTokenError();
        }
    }
    static required(location, field, type) {
        return (req, res, next) => {
            try {
                req.token = Token.verify(req[location][field], type);
                next();
            }
            catch (ex) {
                return res.status(401).json({
                    error: ex instanceof ExpiredTokenError
                        ? {
                            code: 'TOKEN_EXPIRED',
                            msg: 'your token as expired'
                        }
                        : {
                            code: 'TOKEN_INVALID',
                            msg: 'your token is invalid'
                        }
                });
            }
        };
    }
    static body(field, type) {
        return this.required('body', field, type);
    }
    static query(field, type) {
        return this.required('query', field, type);
    }
    static param(field, type) {
        return this.required('params', field, type);
    }
    static header(type) {
        return (req, res, next) => {
            const header = req.header('Authorization');
            if (header == undefined) {
                return res.status(401).json({
                    error: {
                        code: 'TOKEN_MISSING',
                        msg: "a 'Bearer' token is required in 'Authorization' header"
                    }
                });
            }
            try {
                const struct = header.split(' ');
                const htype = struct[0];
                const encoded = struct[1];
                if (htype == null || encoded == null || htype.toLowerCase() !== 'bearer') {
                    return res.status(401).json({
                        error: {
                            code: 'TOKEN_INVALID',
                            msg: "your token in 'Authorization' header must be 'Bearer'"
                        }
                    });
                }
                req.token = Token.verify(encoded, type);
                next();
            }
            catch (ex) {
                return res.status(401).json({
                    error: ex instanceof ExpiredTokenError
                        ? {
                            code: 'TOKEN_EXPIRED',
                            msg: "your token in 'Authorization' header as expired"
                        }
                        : {
                            code: 'TOKEN_INVALID',
                            msg: "your token in 'Authorization' header is invalid"
                        }
                });
            }
        };
    }
}
exports.default = Token;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["SESSION"] = 0] = "SESSION";
    TokenType[TokenType["ACTIVATE_ACCOUNT"] = 1] = "ACTIVATE_ACCOUNT";
    TokenType[TokenType["RESET_PASSWORD"] = 2] = "RESET_PASSWORD";
})(TokenType = exports.TokenType || (exports.TokenType = {}));
class InvalidTokenError extends Error {
    constructor() {
        super('invalid token');
    }
}
exports.InvalidTokenError = InvalidTokenError;
class ExpiredTokenError extends Error {
    constructor() {
        super('expired token');
    }
}
exports.ExpiredTokenError = ExpiredTokenError;
