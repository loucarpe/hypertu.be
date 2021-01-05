import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import Token, { TokenType } from '../../../utils/token'
import { Accounts } from '../../../database/Account'

export default [
  param('id')
    .isInt()
    .withMessage(`must be an int`),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      await Accounts.findByIdAndUpdate(req.token.decoded.id, {
        $pull: { watchlist: req.params.id }
      }).exec()

      return res.status(200).end()
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
