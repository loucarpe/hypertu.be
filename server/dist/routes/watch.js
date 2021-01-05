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
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const torrent_stream_1 = __importDefault(require("torrent-stream"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const axios_1 = __importDefault(require("axios"));
const consts_1 = require("../utils/consts");
const logger_1 = __importDefault(require("../utils/logger"));
fluent_ffmpeg_1.default.setFfmpegPath(require('ffmpeg-static').path);
function getRange(req, file) {
    const filesize = file.length;
    const range = req.header('range') || '';
    const positions = ((range || '').match(/\d+/g) || []).map(Number);
    const start = positions[0] | 0;
    const end = filesize - 1;
    const chunksize = end - start + 1;
    return {
        filesize,
        chunksize,
        start,
        end
    };
}
function stream(req, res, file) {
    logger_1.default.info('Streaming...');
    const range = getRange(req, file);
    const stream = file.createReadStream({
        start: range.start,
        end: range.end
    });
    res.writeHead(206, {
        'Content-Range': `bytes ${range.start}-${range.end}/${range.filesize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': range.chunksize,
        'Content-Type': 'video/mp4',
        Connection: 'keep-alive'
    });
    stream.pipe(res);
}
function streamWithConvertion(res, file, duration) {
    logger_1.default.info('Streaming with convertion...');
    const stream = file.createReadStream();
    res.writeHead(200, {
        'Content-Type': 'video/webm',
        Connection: 'keep-alive'
    });
    const converter = fluent_ffmpeg_1.default()
        .input(stream)
        .videoCodec('libvpx')
        .audioCodec('libvorbis')
        .audioBitrate(128)
        .videoBitrate(1024)
        .duration(duration)
        .output(res)
        .outputFormat('webm')
        .outputOptions([`-threads 2`, '-deadline realtime', '-error-resilient 1'])
        .on('error', () => {
        logger_1.default.error('Convertion failed...');
    });
    converter.run();
    return converter;
}
exports.default = [
    express_validator_1.param('id')
        .isInt()
        .withMessage('must be an int'),
    express_validator_1.param('magnet')
        .isString()
        .withMessage('must be a string'),
    function (req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array()
                });
            }
            try {
                const engine = torrent_stream_1.default(req.params.magnet, {
                    path: '/tmp/hypertube_torrents'
                });
                logger_1.default.info('Leeching...');
                engine.on('ready', () => {
                    let videoFile;
                    for (let file of engine.files) {
                        if (videoFile == undefined && consts_1.MOVIE_FILE_TYPES.includes(path_1.default.extname(file.name))) {
                            videoFile = file;
                        }
                        else {
                            file.deselect();
                        }
                    }
                    if (videoFile == undefined) {
                        return res.status(404).end();
                    }
                    const extension = path_1.default.extname(videoFile.name);
                    if (extension === '.mp4') {
                        stream(req, res, videoFile);
                        res.on('close', () => {
                            engine.destroy(() => { });
                        });
                    }
                    else {
                        axios_1.default
                            .get(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.TMDB_API}`)
                            .then(axRes => {
                            const converter = streamWithConvertion(res, videoFile, parseInt(axRes.data.runtime || 120) * 60);
                            res.on('close', () => {
                                converter.kill('SIGKILL');
                                engine.destroy(() => { });
                            });
                        });
                    }
                });
            }
            catch (ex) {
                return res.status(500).json(ex);
            }
        });
    }
];
