import axios from 'axios'

import { IAccount } from '../database/Account'

export async function populateWatchlist(account: IAccount) {
  let promises = account.watchlist.map(async movieId => {
    try {
      const data = (
        await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}?api_key=${process.env.TMDB_API}&language=${account.language}`
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

  const results = await Promise.all(promises)

  return results.filter(element => element != null)
}
