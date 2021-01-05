import { Request, Response } from 'express'

import Token, { TokenType } from '../../utils/token'

export default [
  Token.header(TokenType.SESSION),
  Token.extractAccount(),

  async function(req: Request, res: Response) {
    try {
      let obj = req.account.toObject()
      delete obj.password

      return res.status(200).json(obj)
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
