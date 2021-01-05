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
function populateWatchlist(account) {
    return __awaiter(this, void 0, void 0, function* () {
        let promises = account.watchlist.map((movieId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = (yield axios_1.default.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API}&language=${account.language}`)).data;
                return {
                    id: data.id,
                    title: data.title,
                    imdb_id: data.imbd_id,
                    release_date: data.release_date,
                    vote: data.vote_average,
                    poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null
                };
            }
            catch (_a) {
                return null;
            }
        }));
        const results = yield Promise.all(promises);
        return results.filter(element => element != null);
    });
}
exports.populateWatchlist = populateWatchlist;
