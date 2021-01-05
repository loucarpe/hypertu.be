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
const moment_1 = __importDefault(require("moment"));
const axios_1 = __importDefault(require("axios"));
const genres_1 = require("../../utils/movies/genres");
const token_1 = __importStar(require("../../utils/token"));
exports.default = [
    express_validator_1.query('page')
        .isInt({ min: 1, max: 500 })
        .withMessage('must be an int between 1 and 500')
        .optional(),
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
            const lang = req.account.language;
            const page = req.query.page || 1;
            const from = moment_1.default()
                .subtract(1, 'year')
                .format('YYYY-MM-DD');
            const to = moment_1.default()
                .subtract(3, 'months')
                .format('YYYY-MM-DD');
            try {
                const data = (yield axios_1.default.get('https://api.themoviedb.org/3/discover/movie?' +
                    `api_key=${process.env.TMDB_API}&` +
                    `sort_by=popularity.desc&` +
                    `language=${lang}&` +
                    `page=${page}&` +
                    `primary_release_date.gte=${from}&` +
                    `primary_release_date.lte=${to}`)).data;
                let results = [];
                for (let movie of data.results) {
                    results.push({
                        id: movie.id,
                        title: movie.title,
                        genres: yield genres_1.genresOf(movie.genre_ids, lang),
                        vote: movie.vote_average,
                        release_date: movie.release_date,
                        poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        original_title: movie.original_title
                    });
                }
                return res.status(200).json({
                    page,
                    total_pages: data.total_pages,
                    results
                });
            }
            catch (ex) {
                if (ex.response.status === 422) {
                    return res.status(409).json({
                        error: {
                            value: req.query.page,
                            msg: ex.response.data.errors[0],
                            param: 'page',
                            location: 'query'
                        }
                    });
                }
                return res.status(500).end();
            }
        });
    }
];
