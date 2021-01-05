import { query, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import moment from 'moment'
import axios from 'axios'

import { genresOf } from '../../utils/movies/genres'
import Token, { TokenType } from '../../utils/token'

async function finalResults(data: any, lang: string) {
  const limit = moment().subtract(3, 'months')

  let results: any[] = []
  for (let movie of data.results) {
    if (moment(movie.release_date).isAfter(limit)) continue

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

  return results
}

async function search(lang: string, page: number, query: string): Promise<{ total_pages: number; results: any[] }> {
  const data = (
    await axios.get(
      'https://api.themoviedb.org/3/search/movie?' +
        `api_key=${process.env.TMDB_API}&` +
        `language=${lang}&` +
        `page=${page}&` +
        `query=${query}&`
    )
  ).data

  return {
    total_pages: data.total_pages,
    results: await finalResults(data, lang)
  }
}

async function filter(
  lang: string,
  page: number,
  year?: number,
  genre?: number
): Promise<{ total_pages: number; results: any[] }> {
  let url =
    'https://api.themoviedb.org/3/discover/movie?' +
    `api_key=${process.env.TMDB_API}&` +
    `language=${lang}&` +
    `page=${page}&` +
    `sort_by=popularity.desc`

  if (year != undefined) url += `&primary_release_year=${year}`
  if (genre != undefined) url += `&with_genres=${genre}`

  console.log()

  const data = (await axios.get(url)).data

  return {
    total_pages: data.total_pages,
    results: await finalResults(data, lang)
  }
}

async function searchAndFilter(
  lang: string,
  page: number,
  query: string,
  year?: number,
  genre?: number
): Promise<{ total_pages: number; results: any[] }> {
  const data = (
    await axios.get(
      'https://api.themoviedb.org/3/search/movie?' +
        `api_key=${process.env.TMDB_API}&` +
        `language=${lang}&` +
        `page=${page}&` +
        `query=${query}&`
    )
  ).data

  const results = (data.results as any[]).filter(movie => {
    const genreCheck = movie.genre_ids.includes(genre)
    const yearCheck = movie.release_date.substring(0, movie.release_date.indexOf('-')) == year

    return genre != undefined && year != undefined ? genreCheck && yearCheck : genreCheck || yearCheck
  })

  return {
    total_pages: data.total_pages,
    results: await finalResults({ results }, lang)
  }
}

export default [
  query('page')
    .isInt({ min: 1, max: 500 })
    .withMessage('must be an int between 1 and 500')
    .optional(),
  query('query')
    .isString()
    .withMessage('must be a string')
    .trim()
    .optional(),
  query('year')
    .isInt()
    .withMessage('must be an int')
    .optional(),
  query('genre')
    .isInt()
    .withMessage('must be an int')
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
    const query = req.query.query
    const year = req.query.year ? parseInt(req.query.year) : undefined
    const genre = req.query.genre ? parseInt(req.query.genre) : undefined

    try {
      let data

      if (query != undefined && year == undefined && genre == undefined) {
        data = await search(lang, page, query)
      } else if (query == undefined && (year != undefined || genre != undefined)) {
        data = await filter(lang, page, year, genre)
      } else if (query != undefined && (year != undefined || genre != undefined)) {
        data = await searchAndFilter(lang, page, query, year, genre)
      }

      if (data == undefined) {
        return res.status(400).end()
      }

      return res.status(200).json({
        page,
        total_pages: data.total_pages,
        results: data.results
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
