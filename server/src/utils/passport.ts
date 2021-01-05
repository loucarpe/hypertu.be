import passport from 'passport'

import { Accounts, IAccount } from '../database/Account'

const FortyTwoStrategy = require('passport-42')
const GoogleStrategy = require('passport-google-oauth20')
const TwitterStrategy = require('passport-twitter')

passport.use(
  new FortyTwoStrategy(
    {
      clientID: process.env.FORTYTWO_APP_ID,
      clientSecret: process.env.FORTYTWO_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/42`
    },
    async function(_accessToken: string, _refreshToken: string, profile: any, done: Function) {
      const id = profile.id
      const email = profile.emails[0].value
      const username = profile.username
      const firstname = profile.name.givenName
      const lastname = profile.name.familyName
      const avatar = profile.photos[0].value

      try {
        let account: IAccount | null

        account = await Accounts.findOne({ authID: id, authProvider: '42' }).exec()

        if (account != null) {
          return done(null, account)
        } else {
          account = await new Accounts({
            authID: id,
            email,
            username,
            firstname,
            lastname,
            avatar,
            authProvider: '42',
            verified: true
          }).save()

          return done(null, account)
        }
      } catch (ex) {
        return done(ex, null)
      }
    }
  )
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google`
    },
    async function(_accessToken: string, _refreshToken: string, profile: any, done: Function) {
      const id = profile.id
      const email = profile.emails[0].value
      const username = (profile.displayName as string).toLowerCase().replace(/\s+/g, '')
      const firstname = profile.name.givenName
      const lastname = profile.name.familyName
      const avatar = profile.photos[0].value

      try {
        let account: IAccount | null

        account = await Accounts.findOne({ authID: id, authProvider: 'google' }).exec()

        if (account != null) {
          return done(null, account)
        } else {
          account = await new Accounts({
            authID: id,
            email,
            username,
            firstname,
            lastname,
            avatar,
            authProvider: 'google',
            verified: true
          }).save()

          return done(null, account)
        }
      } catch (ex) {
        return done(ex, null)
      }
    }
  )
)

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_API_KEY,
      consumerSecret: process.env.TWITTER_SECRET_KEY,
      callbackURL: `${process.env.BASE_URL}/auth/twitter`,
      includeEmail: true
    },
    async function(_accessToken: string, _refreshToken: string, profile: any, done: Function) {
      const id = profile.id
      const email = profile.emails[0].value
      const username = profile.username
      const firstname = profile.displayName
      const lastname = ''
      const avatar = profile.photos[0].value

      try {
        let account: IAccount | null

        account = await Accounts.findOne({ authID: id, authProvider: 'twitter' }).exec()

        if (account != null) {
          return done(null, account)
        } else {
          account = await new Accounts({
            authID: id,
            email,
            username,
            firstname,
            lastname,
            avatar,
            authProvider: 'twitter',
            verified: true
          }).save()

          return done(null, account)
        }
      } catch (ex) {
        return done(ex, null)
      }
    }
  )
)
