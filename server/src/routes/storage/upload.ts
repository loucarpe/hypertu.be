import crypto from 'crypto'
import fs from 'fs'

import { body, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import multer from 'multer'

import { MIME_TYPE } from '../../utils/consts'

export default [
  multer().single('file'),
  body('type')
    .isIn(['avatar'])
    .withMessage('must be one of [avatar]'),

  function(req: Request, res: Response) {
    let fileError: string | undefined = undefined

    if (req.file == undefined) {
      fileError = 'FILE_REQUIRED'
    } else if (MIME_TYPE[req.file.mimetype] == undefined) {
      fileError = 'INVALID_MIME_TYPE'
    } else if (req.file.size > 200 * 1024 /* 200 KB */) {
      fileError = 'FILE_TOO_LARGE'
    }

    const errors = validationResult(req)
    if (!errors.isEmpty() || fileError != undefined) {
      let all: any[] = errors.array()

      if (fileError != undefined)
        [
          all.push({
            msg: fileError,
            param: 'file',
            location: 'file'
          })
        ]

      return res.status(400).json({
        errors: all
      })
    }

    const hex = crypto
      .createHash('md5')
      .update(req.file.buffer)
      .digest('hex')
    const dest = `assets/${req.body.type}/${hex}.${MIME_TYPE[req.file.mimetype]}`

    fs.writeFileSync(dest, req.file.buffer)

    res.status(200).json({
      link: `${process.env.BASE_URL}/${dest}`
    })
  }
]
