import { Request, Response } from 'express'
import axios from 'axios'

import Token, { TokenType } from '../../utils/token'

export default [
  Token.header(TokenType.SESSION),
  Token.extractAccount(['language']),

  async function(req: Request, res: Response) {
    try {
      const data = (
        await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?` +
            `api_key=${process.env.TMDB_API}&` +
            `language=${req.account.language}`
        )
      ).data

      return res.status(200).json(data.genres)
    } catch (error) {
      return res.status(500).end()
    }
  }
]
