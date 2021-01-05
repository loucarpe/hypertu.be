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
function finalResults(data, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const limit = moment_1.default().subtract(3, 'months');
        let results = [];
        for (let movie of data.results) {
            if (moment_1.default(movie.release_date).isAfter(limit))
                continue;
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
        return results;
    });
}
function search(lang, page, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (yield axios_1.default.get('https://api.themoviedb.org/3/search/movie?' +
            `api_key=${process.env.TMDB_API}&` +
            `language=${lang}&` +
            `page=${page}&` +
            `query=${query}&`)).data;
        return {
            total_pages: data.total_pages,
            results: yield finalResults(data, lang)
        };
    });
}
function filter(lang, page, year, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = 'https://api.themoviedb.org/3/discover/movie?' +
            `api_key=${process.env.TMDB_API}&` +
            `language=${lang}&` +
            `page=${page}&` +
            `sort_by=popularity.desc`;
        if (year != undefined)
            url += `&primary_release_year=${year}`;
        if (genre != undefined)
            url += `&with_genres=${genre}`;
        console.log();
        const data = (yield axios_1.default.get(url)).data;
        return {
            total_pages: data.total_pages,
            results: yield finalResults(data, lang)
        };
    });
}
function searchAndFilter(lang, page, query, year, genre) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = (yield axios_1.default.get('https://api.themoviedb.org/3/search/movie?' +
            `api_key=${process.env.TMDB_API}&` +
            `language=${lang}&` +
            `page=${page}&` +
            `query=${query}&`)).data;
        const results = data.results.filter(movie => {
            const genreCheck = movie.genre_ids.includes(genre);
            const yearCheck = movie.release_date.substring(0, movie.release_date.indexOf('-')) == year;
            return genre != undefined && year != undefined ? genreCheck && yearCheck : genreCheck || yearCheck;
        });
        return {
            total_pages: data.total_pages,
            results: yield finalResults({ results }, lang)
        };
    });
}
exports.default = [
    express_validator_1.query('page')
        .isInt({ min: 1, max: 500 })
        .withMessage('must be an int between 1 and 500')
        .optional(),
    express_validator_1.query('query')
        .isString()
        .withMessage('must be a string')
        .trim()
        .optional(),
    express_validator_1.query('year')
        .isInt()
        .withMessage('must be an int')
        .optional(),
    express_validator_1.query('genre')
        .isInt()
        .withMessage('must be an int')
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
            const query = req.query.query;
            const year = req.query.year ? parseInt(req.query.year) : undefined;
            const genre = req.query.genre ? parseInt(req.query.genre) : undefined;
            try {
                let data;
                if (query != undefined && year == undefined && genre == undefined) {
                    data = yield search(lang, page, query);
                }
                else if (query == undefined && (year != undefined || genre != undefined)) {
                    data = yield filter(lang, page, year, genre);
                }
                else if (query != undefined && (year != undefined || genre != undefined)) {
                    data = yield searchAndFilter(lang, page, query, year, genre);
                }
                if (data == undefined) {
                    return res.status(400).end();
                }
                return res.status(200).json({
                    page,
                    total_pages: data.total_pages,
                    results: data.results
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
