"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USERNAME_REGEX = /^[a-zA-Z0-9_]{4,16}$/;
exports.PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&_\-+^()`~]{8,512}$/;
exports.NAME_REGEX = /^[a-zA-ZÀ-ž \-]{4,64}$/;
exports.IMDB_ID_REGEX = /^tt[0-9]+$/;
exports.OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
exports.MIME_TYPE = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};
exports.MOVIE_FILE_TYPES = ['.mp4', '.ogg', '.webm', '.mkv', '.avi'];
exports.AVAILABLE_LANGUAGES = [
    {
        iso: 'en-US',
        osid: 'eng',
        name: 'English'
    },
    {
        iso: 'fr-FR',
        osid: 'fre',
        name: 'Français'
    }
];
