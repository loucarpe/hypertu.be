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
          `https://api.themoviedb.org/3/movie/${req.params.id}?` +
            `api_key=${process.env.TMDB_API}&` +
            `language=${req.account.language}`
        )
      ).data

      return res.status(200).json({
        id: data.id,
        imdb_id: data.imdb_id,
        title: data.title,
        original_title: data.original_title,
        tagline: data.tagline,
        overview: data.overview,
        poster: data.poster_path ? `https://image.tmdb.org/t/p/original${data.poster_path}` : null,
        backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
        release_date: data.release_date,
        genres: (data.genres as any[]).map(val => val.name),
        production_countries: data.production_countries,
        vote_average: data.vote_average,
        runtime: data.runtime,
        production_companies: data.production_companies
      })
    } catch (ex) {
      if (ex.response.status === 404) {
        return res.status(404).end()
      }
      return res.status(500).end()
    }
  }
]
