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
const passport_1 = __importDefault(require("passport"));
const Account_1 = require("../database/Account");
const FortyTwoStrategy = require('passport-42');
const GoogleStrategy = require('passport-google-oauth20');
const TwitterStrategy = require('passport-twitter');
passport_1.default.use(new FortyTwoStrategy({
    clientID: process.env.FORTYTWO_APP_ID,
    clientSecret: process.env.FORTYTWO_APP_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/42`
}, function (_accessToken, _refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = profile.id;
        const email = profile.emails[0].value;
        const username = profile.username;
        const firstname = profile.name.givenName;
        const lastname = profile.name.familyName;
        const avatar = profile.photos[0].value;
        try {
            let account;
            account = yield Account_1.Accounts.findOne({ authID: id, authProvider: '42' }).exec();
            if (account != null) {
                return done(null, account);
            }
            else {
                account = yield new Account_1.Accounts({
                    authID: id,
                    email,
                    username,
                    firstname,
                    lastname,
                    avatar,
                    authProvider: '42',
                    verified: true
                }).save();
                return done(null, account);
            }
        }
        catch (ex) {
            return done(ex, null);
        }
    });
}));
passport_1.default.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google`
}, function (_accessToken, _refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = profile.id;
        const email = profile.emails[0].value;
        const username = profile.displayName.toLowerCase().replace(/\s+/g, '');
        const firstname = profile.name.givenName;
        const lastname = profile.name.familyName;
        const avatar = profile.photos[0].value;
        try {
            let account;
            account = yield Account_1.Accounts.findOne({ authID: id, authProvider: 'google' }).exec();
            if (account != null) {
                return done(null, account);
            }
            else {
                account = yield new Account_1.Accounts({
                    authID: id,
                    email,
                    username,
                    firstname,
                    lastname,
                    avatar,
                    authProvider: 'google',
                    verified: true
                }).save();
                return done(null, account);
            }
        }
        catch (ex) {
            return done(ex, null);
        }
    });
}));
passport_1.default.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_API_KEY,
    consumerSecret: process.env.TWITTER_SECRET_KEY,
    callbackURL: `${process.env.BASE_URL}/auth/twitter`,
    includeEmail: true
}, function (_accessToken, _refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = profile.id;
        const email = profile.emails[0].value;
        const username = profile.username;
        const firstname = profile.displayName;
        const lastname = '';
        const avatar = profile.photos[0].value;
        try {
            let account;
            account = yield Account_1.Accounts.findOne({ authID: id, authProvider: 'twitter' }).exec();
            if (account != null) {
                return done(null, account);
            }
            else {
                account = yield new Account_1.Accounts({
                    authID: id,
                    email,
                    username,
                    firstname,
                    lastname,
                    avatar,
                    authProvider: 'twitter',
                    verified: true
                }).save();
                return done(null, account);
            }
        }
        catch (ex) {
            return done(ex, null);
        }
    });
}));
