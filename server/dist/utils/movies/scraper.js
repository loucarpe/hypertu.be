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
const cheerio_1 = __importDefault(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const PROXIES = [
    'https://ukpiratebayproxy.com/',
    'https://proxyofthepiratebay.com/',
    'https://proxybay.pro/',
    'https://proxybay.center/',
    'https://piratepiratepirate.net/'
];
function extractRowData($, row) {
    const col2 = $(row).children('td:nth-child(2)');
    const col3 = $(row).children('td:nth-child(3)');
    const name = col2
        .children('div.detName')
        .text()
        .replace(/\./g, ' ')
        .trim();
    const magnet = col2.children('a:nth-child(2)').attr('href');
    const seeders = parseInt(col3.text().trim());
    return {
        name,
        magnet,
        seeders
    };
}
function scrap(imdbId) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = [];
        for (let proxy of PROXIES) {
            try {
                const dom = (yield axios_1.default.get(`${proxy}${proxy.charAt(proxy.length - 1) === '/' ? '' : '/'}search/${imdbId}/0/99/0`, {
                    timeout: 3000
                })).data;
                const $ = cheerio_1.default.load(dom);
                const rows = $('table#searchResult > tbody > tr');
                for (let row of Object.values(rows).slice(1, 6)) {
                    const data = extractRowData($, row);
                    if (data.seeders > 1) {
                        results.push(data);
                    }
                }
                if (results.length > 0)
                    break;
            }
            catch (ex) { }
        }
        return results;
    });
}
exports.default = {
    scrap
};
