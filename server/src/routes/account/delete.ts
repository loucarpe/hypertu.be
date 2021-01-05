import { Request, Response } from 'express'

import { Accounts } from '../../database/Account'
import { Comments } from '../../database/Comment'
import Token, { TokenType } from '../../utils/token'

export default [
  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const account = req.token.decoded.id

    try {
      await Comments.remove({ userId: account }).exec()

      await Accounts.findByIdAndRemove(account).exec()
    } catch (ex) {
      return res.status(500).end()
    }

    return res.status(200).end()
  }
]
