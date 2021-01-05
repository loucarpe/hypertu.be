import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import validator from 'validator'
import bcrypt from 'bcrypt'

import Token, { TokenType } from '../../utils/token'
import { Accounts } from '../../database/Account'

export default [
  body('login')
    .isString()
    .withMessage('must be a string'),
  body('password')
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

      if (account != null && bcrypt.compareSync(req.body.password, account.password!)) {
        const token = Token.sign(
          {
            id: account.id
          },
          TokenType.SESSION,
          {
            expiresIn: '7d'
          }
        )

        return res.status(200).json({
          token: token.encoded
        })
      } else {
        return res.status(401).json({
          error: {
            code: 'WRONG_CREDENTIALS',
            msg: `wrong credentials, invalid ${isEmail ? 'email' : 'username'}/password`
          }
        })
      }
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
