import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'

import { AccountSchema, Accounts } from '../../database/Account'
import { PWD_REGEX, USERNAME_REGEX, AVAILABLE_LANGUAGES } from '../../utils/consts'
import Token, { TokenType } from '../../utils/token'

export default [
  body('email')
    .isEmail()
    .withMessage('must be an email')
    .optional(),
  body('username')
    .matches(USERNAME_REGEX)
    .withMessage(`doesn't math with regex: ${USERNAME_REGEX.source}`)
    .optional(),
  body('password')
    .matches(PWD_REGEX)
    .withMessage(`doesn't math with regex: ${PWD_REGEX.source}`)
    .optional(),
  body('firstname')
    .isAlpha('fr-FR')
    .withMessage('must be string with only alpha chars')
    .optional(),
  body('lastname')
    .isAlpha('fr-FR')
    .withMessage('must be string with only alpha chars')
    .optional(),
  body('avatar')
    .isURL({ require_tld: false })
    .withMessage('must be an URL')
    .optional(),
  body('language')
    .isIn(AVAILABLE_LANGUAGES.map(lang => lang.iso))
    .withMessage(`must be one of [${AVAILABLE_LANGUAGES.map(lang => lang.iso)}]`)
    .optional(),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    // Clean unknown keys
    for (let key in req.body) {
      if (!Object.keys(AccountSchema.obj).includes(key)) {
        delete req.body[key]
      }
    }

    if (req.body.password != undefined) {
      req.body.password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT as string))
    }

    try {
      if (req.body.email != undefined) {
        let reqEmail = await Accounts.findOne({ email: req.body.email }).exec()
        if (reqEmail != undefined && reqEmail.id != req.token.decoded.id) {
          return res.status(409).json({
            key: 'email',
            error: `'email' already used by another account`
          })
        }
      }
    } catch (error) {
      return res.status(500).end()
    }

    try {
      if (req.body.username != undefined) {
        let reqUsername = await Accounts.findOne({ username: req.body.username }).exec()
        if (reqUsername != undefined && reqUsername.id != req.token.decoded.id) {
          return res.status(409).json({
            key: 'username',
            error: `'username' already used by another account`
          })
        }
      }
    } catch (error) {
      return res.status(500).end()
    }

    try {
      await Accounts.findByIdAndUpdate(req.token.decoded.id, req.body).exec()

      return res.status(200).end()
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
