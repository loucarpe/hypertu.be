import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import validator from 'validator'

import Token, { TokenType } from '../../utils/token'
import { Accounts } from '../../database/Account'
import { Mail } from '../../utils/mailer'

export default [
  body('login')
    .isString()
    .withMessage('must be a string'),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      const isEmail = validator.isEmail(req.body.login)
      const query = isEmail
        ? {
            email: req.body.login,
            authProvider: 'local'
          }
        : {
            username: req.body.login,
            authProvider: 'local'
          }

      const account = await Accounts.findOne(query).exec()

      if (account != null) {
        const token = Token.sign({ id: account.id }, TokenType.RESET_PASSWORD, { expiresIn: '2h' })

        const mail = new Mail('reset-password', account.email, 'Reset your password')

        mail.send({
          username: account.username,
          url: `${process.env.FRONT_URL}/resetpwd?token=${token.encoded}`
        })
      }

      return res.status(202).end()
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
