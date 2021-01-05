import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import axios from 'axios'

import Token, { TokenType } from '../../utils/token'

export default [
  param('id')
    .isInt()
    .withMessage('must be an int'),

  Token.header(TokenType.SESSION),
  Token.extractAccount(['language']),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      const data = (
        await axios.get(
          `https://api.themoviedb.org/3/movie/${req.params.id}/credits?` +
            `api_key=${process.env.TMDB_API}&` +
            `language=${req.account.language}`
        )
      ).data

      return res.status(200).json(data)
    } catch (ex) {
      if (ex.response.status === 404) {
        return res.status(404).end()
      }
      return res.status(500).end()
    }
  }
]
