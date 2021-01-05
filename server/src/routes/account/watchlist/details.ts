import { Request, Response } from 'express'
import axios from 'axios'

import Token, { TokenType } from '../../../utils/token'

export default [
  Token.header(TokenType.SESSION),
  Token.extractAccount(['watchlist', 'language']),

  async function(req: Request, res: Response) {
    try {
      let promises = req.account.watchlist.map(async movieId => {
        try {
          const data = (
            await axios.get(
              `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API}&language=${req.account.language}`
            )
          ).data

          return {
            id: data.id,
            title: data.title,
            imdb_id: data.imbd_id,
            release_date: data.release_date,
            vote: data.vote_average,
            poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null
          }
        } catch {
          return null
        }
      })

      const rawResults = await Promise.all(promises)
      const results = rawResults.filter(element => element != null)

      return res.status(200).json({
        results
      })
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
