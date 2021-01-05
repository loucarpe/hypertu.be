"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const consts_1 = require("../../utils/consts");
exports.default = [
    multer_1.default().single('file'),
    express_validator_1.body('type')
        .isIn(['avatar'])
        .withMessage('must be one of [avatar]'),
    function (req, res) {
        let fileError = undefined;
        if (req.file == undefined) {
            fileError = 'FILE_REQUIRED';
        }
        else if (consts_1.MIME_TYPE[req.file.mimetype] == undefined) {
            fileError = 'INVALID_MIME_TYPE';
        }
        else if (req.file.size > 200 * 1024 /* 200 KB */) {
            fileError = 'FILE_TOO_LARGE';
        }
        const errors = express_validator_1.validationResult(req);
        if (!errors.isEmpty() || fileError != undefined) {
            let all = errors.array();
            if (fileError != undefined)
                [
                    all.push({
                        msg: fileError,
                        param: 'file',
                        location: 'file'
                    })
                ];
            return res.status(400).json({
                errors: all
            });
        }
        const hex = crypto_1.default
            .createHash('md5')
            .update(req.file.buffer)
            .digest('hex');
        const dest = `assets/${req.body.type}/${hex}.${consts_1.MIME_TYPE[req.file.mimetype]}`;
        fs_1.default.writeFileSync(dest, req.file.buffer);
        res.status(200).json({
            link: `${process.env.BASE_URL}/${dest}`
        });
    }
];
