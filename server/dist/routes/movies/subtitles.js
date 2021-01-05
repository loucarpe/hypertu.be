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
const subtitles_1 = require("../../utils/subtitles");
const token_1 = __importStar(require("../../utils/token"));
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
            try {
                let subtitles = yield subtitles_1.OpenSubtitles.search({
                    sublanguageid: consts_1.AVAILABLE_LANGUAGES.map(lang => lang.osid).join(','),
                    imdbid: req.params.imdb_id
                });
                for (let lang in subtitles) {
                    subtitles[lang] = {
                        name: subtitles[lang].lang,
                        file: subtitles[lang].vtt
                    };
                }
                return res.json(subtitles);
            }
            catch (ex) {
                return res.status(500).end();
            }
        });
    }
];
