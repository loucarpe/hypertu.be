import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import Token, { TokenType } from '../utils/token'
import { Accounts } from '../database/Account'
import { populateWatchlist } from '../utils/account'

export default [
  param('username')
    .isString()
    .withMessage('must be a string'),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      const account = await Accounts.findOne({ username: req.params.username }).exec()
      if (!account) {
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            msg: 'profile not found'
          }
        })
      }

      let obj = account.toObject()
      delete obj.password
      delete obj.email
      obj.watchlist = await populateWatchlist(account)

      return res.status(200).json(obj)
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
