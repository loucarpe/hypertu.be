import axios from 'axios'

var gGenres: {
  [key: string]: {
    [key: number]: string
  }
} = {}

async function fetchGenres(lang: string) {
  const axres = await axios.get(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API}&language=${lang}`
  )

  gGenres[lang] = {}
  for (let genre of axres.data.genres) {
    gGenres[lang][genre.id] = genre.name
  }
}

export async function genresOf(ids: number[], lang: string) {
  let results: string[] = []

  if (gGenres[lang] == undefined) await fetchGenres(lang)

  for (let id of ids) {
    if (gGenres[lang][id] == undefined) await fetchGenres(lang)
    results.push(gGenres[lang][id])
  }

  return results
}
