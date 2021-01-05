import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'

import Token, { TokenType } from '../../utils/token'
import { Accounts } from '../../database/Account'
import { PWD_REGEX } from '../../utils/consts'

export default [
  body('new_password')
    .matches(PWD_REGEX)
    .withMessage(`doesn't math with regex: ${PWD_REGEX.source}`),

  Token.body('token', TokenType.RESET_PASSWORD),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      await Accounts.findByIdAndUpdate(req.token.decoded.id, {
        password: await bcrypt.hash(req.body.new_password, parseInt(process.env.BCRYPT_SALT as string))
      }).exec()

      return res.status(200).end()
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
