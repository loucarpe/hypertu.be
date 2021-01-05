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
Object.defineProperty(exports, "__esModule", { value: true });
const OS = require('opensubtitles-api');
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            exports.OpenSubtitles = new OS({
                useragent: process.env.OPENSUBTITLES_USERAGENT,
                username: process.env.OPENSUBTITLES_USERNAME,
                password: process.env.OPENSUBTITLES_PASSWORD,
                ssl: true
            });
            yield exports.OpenSubtitles.login();
        }
        catch (ex) { }
    });
}
exports.init = init;
