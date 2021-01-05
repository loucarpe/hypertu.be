"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.AccountSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, default: '' },
    avatar: { type: String, required: true },
    authProvider: { type: String, default: 'local' },
    verified: { type: Boolean, default: false },
    watchlist: { type: [Number], required: true },
    language: { type: String, default: 'en-US' },
    password: String,
    authID: String
}, { versionKey: false });
exports.AccountSchema.index({ email: 1, authProvider: 1 }, {
    unique: true,
    partialFilterExpression: {
        email: { $type: 'string' },
        authProvider: { $type: 'string' }
    }
});
exports.AccountSchema.index({ username: 1, authProvider: 1 }, {
    unique: true,
    partialFilterExpression: {
        username: { $type: 'string' },
        authProvider: { $type: 'string' }
    }
});
exports.AccountSchema.index({ authID: 1, authProvider: 1 }, {
    unique: true,
    partialFilterExpression: {
        authID: { $type: 'string' },
        authProvider: { $type: 'string' }
    }
});
exports.Accounts = mongoose_1.model('Account', exports.AccountSchema);
