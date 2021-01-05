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
const axios_1 = __importDefault(require("axios"));
var gGenres = {};
function fetchGenres(lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const axres = yield axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API}&language=${lang}`);
        gGenres[lang] = {};
        for (let genre of axres.data.genres) {
            gGenres[lang][genre.id] = genre.name;
        }
    });
}
function genresOf(ids, lang) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = [];
        if (gGenres[lang] == undefined)
            yield fetchGenres(lang);
        for (let id of ids) {
            if (gGenres[lang][id] == undefined)
                yield fetchGenres(lang);
            results.push(gGenres[lang][id]);
        }
        return results;
    });
}
exports.genresOf = genresOf;
