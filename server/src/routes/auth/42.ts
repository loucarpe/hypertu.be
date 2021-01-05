import { Request, Response } from 'express'
import passport from 'passport'

import Token, { TokenType } from '../../utils/token'
import { IAccount } from '../../database/Account'

export default [
  passport.authenticate('42', {
    session: false
  }),

  function(req: Request, res: Response) {
    if (req.user != undefined) {
      const account = req.user as IAccount

      const token = Token.sign(
        {
          id: account.id
        },
        TokenType.SESSION,
        {
          expiresIn: '7d'
        }
      )

      return res.render('oauth', {
        account,
        token: token.encoded,
        origin: process.env.FRONT_URL
      })
    }

    return res.status(302).end()
  }
]
