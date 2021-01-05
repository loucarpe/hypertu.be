import fs from 'fs'

import express, { Request, Response, NextFunction } from 'express'
import swaggerUI from 'swagger-ui-express'
import session from 'express-session'
import parser from 'body-parser'
import mongoose from 'mongoose'
import passport from 'passport'
import { CronJob } from 'cron'
import dotenv from 'dotenv'
import moment from 'moment'
import YAML from 'yaml'
import cors from 'cors'

import * as subtitles from './utils/subtitles'
import { Mail } from './utils/mailer'
import router from './routes/router'
import logger from './utils/logger'

const loaders: Promise<any>[] = []
logger.info('[Express] starting...')

/******************/
/* Initialization */
/******************/

// Load .env file into `process.env`
if (!fs.existsSync('.env')) {
  logger.error('[Express] missing .env file')
  process.exit(1)
}
dotenv.config()

// Express App
const app = express()
const port = parseInt(process.env.NODE_PORT || process.env.PORT || '5000')

// Define urls based on NODE_ENV
process.env.BASE_URL = /*process.env.NODE_ENV === 'production' ? 'https://api.hypertu.be' : */`http://localhost:${port}`
process.env.FRONT_URL = /*process.env.NODE_ENV === 'production' ? 'https://hypertu.be' : */'http://localhost:3000'

// Initializers
Mail.init()
loaders.push(subtitles.init())

// Cron task
var job = new CronJob(
  '42 0 * * *',
  () => {
    const isTooOld = (filepath: string) => {
      const atime = moment(fs.statSync(filepath).atime)
      const diff = atime.diff(Date.now()) // in milliseconds
      return diff < -(moment(0).add(1, 'month').valueOf()) // 1 month
    }

    const root = '/tmp/hypertube_torrents'
    const torrents = fs.readdirSync(root)
    for (let torrent of torrents) {
      const path = `${root}/${torrent}`
      if (fs.statSync(path).isDirectory()) {
        const files = fs.readdirSync(path)
        for (let file of files) {
          const filepath = `${root}/${torrent}/${file}`
          if (isTooOld(filepath)) fs.unlinkSync(filepath)
        }
        if (fs.readdirSync(path).length <= 0) fs.rmdirSync(path)
      } else {
        if (isTooOld(path)) fs.unlinkSync(path)
      }
    }
  },
  () => {},
  true,
  'Europe/Paris'
)
job.start()

// Init Passport
require('./utils/passport')

/***************/
/* Middlewares */
/***************/

// View engine
app.set('view engine', 'ejs')

// Body parsing
app.use(parser.urlencoded({ extended: true }))
app.use(parser.json())

// Session
app.use(
  session({
    secret: 'hypertu.be',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
)

// CORS
app.use(cors())

// Handle invalid json error
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error != null && error instanceof SyntaxError) {
    return res.status(422).json({
      error: 'invalid json'
    })
  }
  return next()
})

// Use Passport
app.use(passport.initialize())

// Others
app.use(function(req: Request, res: Response, next: NextFunction) {
  res.removeHeader('X-Powered-By')
  logger.info(`[Express] ${req.method} ${req.url} ${req.ip}`)
  return next()
})

/*****************/
/* Static assets */
/*****************/

// Bind assets directory
app.use('/assets', express.static('assets/'))

// Create directories if not exists
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets')
}
if (!fs.existsSync('assets/avatar')) {
  fs.mkdirSync('assets/avatar')
}

/**********/
/* Router */
/**********/

// Bind every routes of api
app.use(router())

/**************/
/* Swagger UI */
/**************/

// Read apidoc yaml file
const apidoc = fs.readFileSync('./apidoc.yml').toString()

// Serve swagger resources
app.use(swaggerUI.serve)

// Bind '/' on Swagger UI
app.get(
  '/',
  swaggerUI.setup(YAML.parse(apidoc), {
    customSiteTitle: 'Hypertube API',
    customfavIcon: '/assets/images/favicon.png',
    customJs: '/assets/js/swagger.js'
  })
)

/*******************/
/* MongoDB & Start */
/*******************/

logger.info('[MongoDB] connection...')

// Connect to mongodb
// if success: start server
// else: stop server
mongoose.connect(
  'mongodb://localhost/hypertube',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  err => {
    if (err) {
      logger.error('[MongoDB] connection failed')
      process.exit(1)
    } else {
      logger.info('[MongoDB] connected')

      Promise.all(loaders).then(() => {
        app.listen(port, () => {
          logger.info(`[Express] started on port ${port}`)
        })
      })
    }
  }
)
