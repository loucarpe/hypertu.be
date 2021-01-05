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
const axios_1 = __importDefault(require("axios"));
const token_1 = __importStar(require("../../utils/token"));
exports.default = [
    token_1.default.header(token_1.TokenType.SESSION),
    token_1.default.extractAccount(['language']),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = (yield axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?` +
                    `api_key=${process.env.TMDB_API}&` +
                    `language=${req.account.language}`)).data;
                return res.status(200).json(data.genres);
            }
            catch (error) {
                return res.status(500).end();
            }
        });
    }
];
