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
const consts_1 = require("../../utils/consts");
const scraper_1 = __importDefault(require("../../utils/movies/scraper"));
const token_1 = __importStar(require("../../utils/token"));
function find(str, regex) {
    const matches = str.match(regex) || [];
    if (matches.length > 0)
        return matches[0];
    else
        return null;
}
function parseTorrentName(name) {
    const quality = find(name, /(WEBRip|HDRip|BluRay|HD-TS|WEB-DL|HDCAM|BRRip|DVDScr)/gi);
    const vCodec = find(name, /((x|h)[0-9]{3}|xvid|vp[3-9]{1})/gi);
    const aCodec = find(name, /(AAC|AC3|SBR)/gi);
    const resolution = find(name, /[0-9]{3,}p/gi);
    let result = '';
    result += quality ? `${quality} ` : '';
    result += (vCodec && aCodec) ? ` ${vCodec}-${aCodec}` : ` ${vCodec || aCodec || ''}`;
    result += resolution ? ` (${resolution})` : '';
    return result.trim();
}
exports.default = [
    express_validator_1.param('imdb_id')
        .isString()
        .matches(consts_1.IMDB_ID_REGEX)
        .withMessage('must be an imdb id'),
    token_1.default.header(token_1.TokenType.SESSION),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            let torrents = yield scraper_1.default.scrap(req.params.imdb_id);
            torrents = torrents.map(torrent => (Object.assign(Object.assign({}, torrent), { name: parseTorrentName(torrent.name) })));
            return res.status(200).json({
                results: torrents
            });
        });
    }
];
