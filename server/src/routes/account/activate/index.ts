import { Request, Response } from 'express'

import Token, { TokenType } from '../../../utils/token'
import { Accounts } from '../../../database/Account'

export default [
  Token.body('token', TokenType.ACTIVATE_ACCOUNT),

  async function(req: Request, res: Response) {
    try {
      await Accounts.findByIdAndUpdate(req.token.decoded.id, { verified: true }).exec()

      return res.status(200).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
]
