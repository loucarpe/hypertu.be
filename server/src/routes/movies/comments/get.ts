import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import Token, { TokenType } from '../../../utils/token'
import { Comments } from '../../../database/Comment'

export default [
  param('movieId')
    .isInt()
    .withMessage('must be an int'),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const comments = await Comments.find({ movieId: req.params.movieId }).populate({
      path: 'userId',
      select: 'username avatar'
    })

    return res.status(200).json({
      comments: comments || []
    })
  }
]
