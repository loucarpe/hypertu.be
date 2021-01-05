"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_1 = __importDefault(require("./account"));
const update_1 = __importDefault(require("./account/update"));
const activate_1 = __importDefault(require("./account/activate"));
const send_1 = __importDefault(require("./account/activate/send"));
const delete_1 = __importDefault(require("./account/delete"));
const details_1 = __importDefault(require("./account/watchlist/details"));
const put_1 = __importDefault(require("./account/watchlist/put"));
const delete_2 = __importDefault(require("./account/watchlist/delete"));
const _42_1 = __importDefault(require("./auth/42"));
const google_1 = __importDefault(require("./auth/google"));
const twitter_1 = __importDefault(require("./auth/twitter"));
const signup_1 = __importDefault(require("./auth/signup"));
const signin_1 = __importDefault(require("./auth/signin"));
const forgotpwd_1 = __importDefault(require("./auth/forgotpwd"));
const resetpwd_1 = __importDefault(require("./auth/resetpwd"));
const movies_1 = __importDefault(require("./movies"));
const search_1 = __importDefault(require("./movies/search"));
const details_2 = __importDefault(require("./movies/details"));
const credits_1 = __importDefault(require("./movies/credits"));
const torrents_1 = __importDefault(require("./movies/torrents"));
const get_1 = __importDefault(require("./movies/comments/get"));
const put_2 = __importDefault(require("./movies/comments/put"));
const delete_3 = __importDefault(require("./movies/comments/delete"));
const subtitles_1 = __importDefault(require("./movies/subtitles"));
const genres_1 = __importDefault(require("./movies/genres"));
const profile_1 = __importDefault(require("./profile"));
const upload_1 = __importDefault(require("./storage/upload"));
const watch_1 = __importDefault(require("./watch"));
exports.default = () => {
    const router = express_1.Router();
    /***********/
    /* Account */
    /***********/
    router.get('/account', ...account_1.default);
    router.post('/account/update', ...update_1.default);
    // Activate
    router.post('/account/activate', ...activate_1.default);
    router.post('/account/activate/send', ...send_1.default);
    // Delete
    router.delete('/account/delete', ...delete_1.default);
    // Watchlist
    router.get('/account/watchlist/details', ...details_1.default);
    router.put('/account/watchlist/:id', ...put_1.default);
    router.delete('/account/watchlist/:id', ...delete_2.default);
    /********/
    /* Auth */
    /********/
    router.get('/auth/42', ..._42_1.default);
    router.get('/auth/google', ...google_1.default);
    router.get('/auth/twitter', ...twitter_1.default);
    router.post('/auth/signup', ...signup_1.default);
    router.post('/auth/signin', ...signin_1.default);
    router.post('/auth/forgotpwd', ...forgotpwd_1.default);
    router.post('/auth/resetpwd', ...resetpwd_1.default);
    /**********/
    /* Movies */
    /**********/
    router.get('/movies', ...movies_1.default);
    router.get('/movies/search', ...search_1.default);
    router.get('/movies/details/:id', ...details_2.default);
    router.get('/movies/credits/:id', ...credits_1.default);
    router.get('/movies/torrents/:imdb_id', ...torrents_1.default);
    router.get('/movies/subtitles/:imdb_id', ...subtitles_1.default);
    router.get('/movies/genres', ...genres_1.default);
    // Comments
    router.get('/movies/:movieId/comments', ...get_1.default);
    router.put('/movies/comments', ...put_2.default);
    router.delete('/movies/:movieId/comments/:commentId', ...delete_3.default);
    /***********/
    /* Profile */
    /***********/
    router.get('/profile/:username', ...profile_1.default);
    /***********/
    /* Storage */
    /***********/
    router.put('/storage/upload', ...upload_1.default);
    /*********/
    /* Watch */
    /*********/
    router.get('/watch/:id/:magnet', ...watch_1.default);
    return router;
};
