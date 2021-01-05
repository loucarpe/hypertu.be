"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.CommentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Account', required: true },
    movieId: { type: Number, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
}, { versionKey: false });
exports.Comments = mongoose_1.model('Comment', exports.CommentSchema);
