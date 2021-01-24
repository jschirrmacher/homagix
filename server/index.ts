import path from 'path'
import express, { NextFunction, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import Models from './models/index'
import EventStore from './EventStore/EventStore'
import DishReader from './Dishes/DishReader'
import MainRouter from './MainRouter'
import ModelWriter from './models/ModelWriter'
import history from 'connect-history-api-fallback'
import Auth from './auth/auth'
import listRoutes from './lib/listRoutes'

const nodeEnv = process.env.NODE_ENV || 'development'
const logger = console
const baseDir = path.resolve(__dirname, '..')

const PORT = process.env.PORT || 8200

const basePath = path.resolve(baseDir ,'data')
const migrationsPath = path.resolve(__dirname, 'migrations')
const store = EventStore({ basePath, logger, migrationsPath })
const modelWriter = ModelWriter({ basePath })
const models = Models({ store, modelWriter })

const dishReader = DishReader({ store, models })

const app = express()
app.set('json spaces', 2)
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const auth = Auth({ app, models, store, secretOrKey: process.env.SECRET || '' })
const router = MainRouter({ models, store, auth })

async function setupHotLoading() {
  if (process.env.NODE_ENV === 'development') {
    const webpack = await require('./WebpackAdapter')
    webpack.setup(app, logger)
  }
}

setupHotLoading()

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use(router)
app.use(history({}))
app.use('/', express.static(path.join(baseDir, 'build')))
app.use('/', express.static(path.join(baseDir, 'public')))
app.use('/images', express.static(path.join(baseDir, 'data', 'images')))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use(function (err: {code?: number, message?: string}, req: Request, res: Response, next: NextFunction) {
  logger.error(err)
  res.status(err.code || 500).json({ error: err.message || err.toString() })
})

app.listen(PORT, async () => {
  dishReader.loadData(basePath)
  await store.replay()
  logger.info(`Listening on http://localhost:${PORT} (NODE_ENV=${nodeEnv})`)
})

console.log(listRoutes(app))
