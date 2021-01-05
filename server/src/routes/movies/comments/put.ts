import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import { MongoError } from 'mongodb'

import Token, { TokenType } from '../../../utils/token'
import { Comments } from '../../../database/Comment'

export default [
  body('movieId')
    .isInt()
    .withMessage('must be an int'),
  body('message')
    .isString()
    .not()
    .isEmpty()
    .withMessage('please provide a message'),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const { movieId, message } = req.body

    try {
      await new Comments({
        userId: req.token.decoded.id,
        movieId,
        message
      }).save()

      return res.status(201).end()
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
