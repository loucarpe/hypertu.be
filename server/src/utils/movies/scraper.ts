import cheerio from 'cheerio'
import axios from 'axios'

const PROXIES: string[] = [
  'https://ukpiratebayproxy.com/',
  'https://proxyofthepiratebay.com/',
  'https://proxybay.pro/',
  'https://proxybay.center/',
  'https://piratepiratepirate.net/'
]

interface ITorrent {
  name: string
  magnet?: string
  seeders: number
}

function extractRowData($: CheerioStatic, row: CheerioElement): ITorrent {
  const col2 = $(row).children('td:nth-child(2)')
  const col3 = $(row).children('td:nth-child(3)')

  const name = col2
    .children('div.detName')
    .text()
    .replace(/\./g, ' ')
    .trim()
  const magnet = col2.children('a:nth-child(2)').attr('href')
  const seeders = parseInt(col3.text().trim())

  return {
    name,
    magnet,
    seeders
  }
}

async function scrap(imdbId: string): Promise<ITorrent[]> {
  let results: ITorrent[] = []

  for (let proxy of PROXIES) {
    try {
      const dom = (
        await axios.get(`${proxy}${proxy.charAt(proxy.length - 1) === '/' ? '' : '/'}search/${imdbId}/0/99/0`, {
          timeout: 3000
        })
      ).data
      const $ = cheerio.load(dom)

      const rows = $('table#searchResult > tbody > tr')

      for (let row of Object.values(rows).slice(1, 6)) {
        const data = extractRowData($, row)

        if (data.seeders > 1) {
          results.push(data)
        }
      }

      if (results.length > 0) break
    } catch (ex) {}
  }

  return results
}

export default {
  scrap
}
