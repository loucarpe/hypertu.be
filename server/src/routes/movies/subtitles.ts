import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'

import { IMDB_ID_REGEX, AVAILABLE_LANGUAGES } from '../../utils/consts'
import { OpenSubtitles } from '../../utils/subtitles'
import Token, { TokenType } from '../../utils/token'

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

    try {
      let subtitles = await OpenSubtitles.search({
        sublanguageid: AVAILABLE_LANGUAGES.map(lang => lang.osid).join(','),
        imdbid: req.params.imdb_id
      })

      for (let lang in subtitles) {
        subtitles[lang] = {
          name: subtitles[lang].lang,
          file: subtitles[lang].vtt
        }
      }

      return res.json(subtitles)
    } catch (ex) {
      return res.status(500).end()
    }
  }
]
