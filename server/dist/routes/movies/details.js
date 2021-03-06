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
const axios_1 = __importDefault(require("axios"));
const token_1 = __importStar(require("../../utils/token"));
exports.default = [
    express_validator_1.param('id')
        .isInt()
        .withMessage('must be an int'),
    token_1.default.header(token_1.TokenType.SESSION),
    token_1.default.extractAccount(['language']),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            try {
                const data = (yield axios_1.default.get(`https://api.themoviedb.org/3/movie/${req.params.id}?` +
                    `api_key=${process.env.TMDB_API}&` +
                    `language=${req.account.language}`)).data;
                return res.status(200).json({
                    id: data.id,
                    imdb_id: data.imdb_id,
                    title: data.title,
                    original_title: data.original_title,
                    tagline: data.tagline,
                    overview: data.overview,
                    poster: data.poster_path ? `https://image.tmdb.org/t/p/original${data.poster_path}` : null,
                    backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
                    release_date: data.release_date,
                    genres: data.genres.map(val => val.name),
                    production_countries: data.production_countries,
                    vote_average: data.vote_average,
                    runtime: data.runtime,
                    production_companies: data.production_companies
                });
            }
            catch (ex) {
                if (ex.response.status === 404) {
                    return res.status(404).end();
                }
                return res.status(500).end();
            }
        });
    }
];
