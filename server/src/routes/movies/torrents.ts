import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import { IMDB_ID_REGEX } from '../../utils/consts'
import scraper from '../../utils/movies/scraper'
import Token, { TokenType } from '../../utils/token'

function find(str: string, regex: RegExp): string | null {
  const matches = str.match(regex) || []
  if (matches.length > 0)
    return matches[0]
  else
    return null
}

function parseTorrentName(name: string): string {
  const quality = find(name, /(WEBRip|HDRip|BluRay|HD-TS|WEB-DL|HDCAM|BRRip|DVDScr)/gi)
  const vCodec = find(name, /((x|h)[0-9]{3}|xvid|vp[3-9]{1})/gi)
  const aCodec = find(name, /(AAC|AC3|SBR)/gi)
  const resolution = find(name, /[0-9]{3,}p/gi)

  let result = ''
  
  result += quality ? `${quality} ` : ''
  result += (vCodec && aCodec) ? ` ${vCodec}-${aCodec}` : ` ${vCodec || aCodec || ''}`
  result += resolution ? ` (${resolution})` : ''

  return result.trim()
}

export default [
  param('imdb_id')
    .isString()
    .matches(IMDB_ID_REGEX)
    .withMessage('must be an imdb id'),

  Token.header(TokenType.SESSION),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    let torrents = await scraper.scrap(req.params.imdb_id)
    torrents = torrents.map(torrent => ({
      ...torrent,
      name: parseTorrentName(torrent.name)
    }))

    return res.status(200).json({
      results: torrents
    })
  }
]
