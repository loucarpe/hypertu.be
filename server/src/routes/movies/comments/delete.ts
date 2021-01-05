import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import { OBJECT_ID_REGEX } from '../../../utils/consts'
import Token, { TokenType } from '../../../utils/token'
import { Comments } from '../../../database/Comment'

export default [
  param('movieId')
    .isInt()
    .withMessage('must be an int'),
  param('commentId')
    .matches(OBJECT_ID_REGEX)
    .withMessage(`doesn't match with regex: ${OBJECT_ID_REGEX.source}`),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      const comment = await Comments.findById(req.params.commentId).exec()
      if (!comment) {
        return res.status(404).json({
          error: {
            code: 'COMMENT_NOT_FOUND',
            msg: 'comment not found'
          }
        })
      }

      if (comment.userId.toString() !== req.token.decoded.id) {
        return res.status(401).json({
          error: {
            code: 'UNAUTHORIZED_ACTION',
            msg: 'you cannot delete a comment that is not yours'
          }
        })
      }

      await Comments.findByIdAndDelete(comment._id)

      return res.status(200).end()
    } catch (error) {
      return res.status(500).end()
    }
  }
]
