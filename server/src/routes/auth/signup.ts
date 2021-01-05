import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import { MongoError } from 'mongodb'
import bcrypt from 'bcrypt'

import { USERNAME_REGEX, PWD_REGEX, NAME_REGEX, AVAILABLE_LANGUAGES } from '../../utils/consts'
import { Accounts } from '../../database/Account'

export default [
  body('email')
    .isEmail()
    .withMessage('must be an email'),
  body('username')
    .matches(USERNAME_REGEX)
    .withMessage(`doesn't math with regex: ${USERNAME_REGEX.source}`),
  body('password')
    .matches(PWD_REGEX)
    .withMessage(`doesn't math with regex: ${PWD_REGEX.source}`),
  body('firstname')
    .matches(NAME_REGEX)
    .withMessage(`doesn't math with regex: ${NAME_REGEX.source}`),
  body('lastname')
    .matches(NAME_REGEX)
    .withMessage(`doesn't math with regex: ${NAME_REGEX.source}`),
  body('avatar')
    .isURL({ require_tld: false })
    .withMessage('must be an URL'),
  body('language')
    .isIn(AVAILABLE_LANGUAGES.map(lang => lang.iso))
    .withMessage(`must be one of [${AVAILABLE_LANGUAGES.map(lang => lang.iso)}]`)
    .optional(),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const password = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT as string))

    try {
      await new Accounts(
        Object.assign(
          {
            email: req.body.email,
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            avatar: req.body.avatar,
            password
          },
          req.body.language ? { language: req.body.language } : {}
        )
      ).save()

      return res.status(201).end()
    } catch (ex) {
      if (ex instanceof MongoError) {
        if (ex.code === 11000) {
          const key = (ex.errmsg as string).includes('username') ? 'username' : 'email'

          return res.status(409).json({
            key: key,
            error: `'${key}' already used by another account`
          })
        }
        return res.status(520).json({
          error: ex.errmsg
        })
      }
      return res.status(500).end()
    }
  }
]
