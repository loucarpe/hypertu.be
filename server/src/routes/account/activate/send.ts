import { Request, Response } from 'express'

import Token, { TokenType } from '../../../utils/token'
import { Mail } from '../../../utils/mailer'

export default [
  Token.header(TokenType.SESSION),
  Token.extractAccount(['_id', 'email', 'username']),

  async function(req: Request, res: Response) {
    try {
      const token = Token.sign(
        {
          id: req.account._id
        },
        TokenType.ACTIVATE_ACCOUNT,
        {
          expiresIn: '1d'
        }
      )

      const mail = new Mail('account-activation', req.account.email, 'Activate your account')

      mail.send({
        username: req.account.username,
        url: `${process.env.FRONT_URL}/account/activate?token=${token.encoded}`
      })

      return res.status(202).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
]
