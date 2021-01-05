import { ReadStream } from 'fs'
import path from 'path'

import { param, validationResult } from 'express-validator'
import { Request, Response } from 'express'
import torrentStream from 'torrent-stream'
import ffmpeg from 'fluent-ffmpeg'
import axios from 'axios'

import { MOVIE_FILE_TYPES } from '../utils/consts'
import logger from '../utils/logger'

ffmpeg.setFfmpegPath(require('ffmpeg-static').path)

function getRange(req: Request, file: TorrentStream.TorrentFile) {
  const filesize = file.length

  const range = req.header('range') || ''
  const positions = ((range || '').match(/\d+/g) || []).map(Number)

  const start = positions[0] | 0
  const end = filesize - 1
  const chunksize = end - start + 1

  return {
    filesize,
    chunksize,
    start,
    end
  }
}

function stream(req: Request, res: Response, file: TorrentStream.TorrentFile) {
  logger.info('Streaming...')

  const range = getRange(req, file)
  const stream = file.createReadStream({
    start: range.start,
    end: range.end
  }) as ReadStream

  res.writeHead(206, {
    'Content-Range': `bytes ${range.start}-${range.end}/${range.filesize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': range.chunksize,
    'Content-Type': 'video/mp4',
    Connection: 'keep-alive'
  })

  stream.pipe(res)
}

function streamWithConvertion(res: Response, file: TorrentStream.TorrentFile, duration: number): ffmpeg.FfmpegCommand {
  logger.info('Streaming with convertion...')

  const stream = file.createReadStream()

  res.writeHead(200, {
    'Content-Type': 'video/webm',
    Connection: 'keep-alive'
  })

  const converter = ffmpeg()
    .input(stream)
    .videoCodec('libvpx')
    .audioCodec('libvorbis')
    .audioBitrate(128)
    .videoBitrate(1024)
    .duration(duration)
    .output(res)
    .outputFormat('webm')
    .outputOptions([`-threads 2`, '-deadline realtime', '-error-resilient 1'])
    .on('error', () => {
      logger.error('Convertion failed...')
    })

  converter.run()

  return converter
}

export default [
  param('id')
    .isInt()
    .withMessage('must be an int'),
  param('magnet')
    .isString()
    .withMessage('must be a string'),

  async function(req: Request, res: Response) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      })
    }

    try {
      const engine = torrentStream(req.params.magnet, {
        path: '/tmp/hypertube_torrents'
      })
      logger.info('Leeching...')

      engine.on('ready', () => {
        let videoFile: TorrentStream.TorrentFile | undefined

        for (let file of engine.files) {
          if (videoFile == undefined && MOVIE_FILE_TYPES.includes(path.extname(file.name))) {
            videoFile = file
          } else {
            file.deselect()
          }
        }

        if (videoFile == undefined) {
          return res.status(404).end()
        }

        const extension = path.extname(videoFile.name)

        if (extension === '.mp4') {
          stream(req, res, videoFile)

          res.on('close', () => {
            engine.destroy(() => {})
          })
        } else {
          axios
            .get(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.TMDB_API}`)
            .then(axRes => {
              const converter = streamWithConvertion(res, videoFile!, parseInt(axRes.data.runtime || 120) * 60)

              res.on('close', () => {
                converter.kill('SIGKILL')
                engine.destroy(() => {})
              })
            })
        }
      })
    } catch (ex) {
      return res.status(500).json(ex)
    }
  }
]
