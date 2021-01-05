import { query, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import moment from 'moment'
import axios from 'axios'

import { genresOf } from '../../utils/movies/genres'
import Token, { TokenType } from '../../utils/token'

export default [
  query('page')
    .isInt({ min: 1, max: 500 })
    .withMessage('must be an int between 1 and 500')
    .optional(),

  Token.header(TokenType.SESSION),
  Token.extractAccount(['language']),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    const lang = req.account.language
    const page = req.query.page || 1
    const from = moment()
      .subtract(1, 'year')
      .format('YYYY-MM-DD')
    const to = moment()
      .subtract(3, 'months')
      .format('YYYY-MM-DD')

    try {
      const data = (
        await axios.get(
          'https://api.themoviedb.org/3/discover/movie?' +
            `api_key=${process.env.TMDB_API}&` +
            `sort_by=popularity.desc&` +
            `language=${lang}&` +
            `page=${page}&` +
            `primary_release_date.gte=${from}&` +
            `primary_release_date.lte=${to}`
        )
      ).data

      let results: any[] = []
      for (let movie of data.results) {
        results.push({
          id: movie.id,
          title: movie.title,
          genres: await genresOf(movie.genre_ids, lang),
          vote: movie.vote_average,
          release_date: movie.release_date,
          poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
          original_title: movie.original_title
        })
      }

      return res.status(200).json({
        page,
        total_pages: data.total_pages,
        results
      })
    } catch (ex) {
      if (ex.response.status === 422) {
        return res.status(409).json({
          error: {
            value: req.query.page,
            msg: ex.response.data.errors[0],
            param: 'page',
            location: 'query'
          }
        })
      }
      return res.status(500).end()
    }
  }
]
