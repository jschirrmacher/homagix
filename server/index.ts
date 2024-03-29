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
import Config from './Config'
import cors from "cors"

const logger = console

const { nodeEnv, baseDir, dataDir, migrationsPath, PORT } = Config({ logger })

const store = EventStore({ basePath: dataDir, logger, migrationsPath })
const modelWriter = ModelWriter({ basePath: dataDir })
const models = Models({ store, modelWriter })

const dishReader = DishReader({ store, models })

const app = express()
app.set('json spaces', 2)
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
const auth = Auth({ app, models, store, secretOrKey: process.env.SECRET || '' })
const router = MainRouter({ models, store, auth })

async function setupHotLoading() {
  const webpack = await import('./WebpackAdapter')
  webpack.setup(app)
}

if (process.env.NODE_ENV === 'development') {
  setupHotLoading()
}

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use(router)
app.use(history({}))
app.use('/', express.static(path.join(__dirname, '..', 'frontend')))
app.use('/', express.static(path.join(baseDir, 'public')))
app.use('/images', express.static(path.join(dataDir, 'images')))

app.use(function (
  err: { code?: number; message?: string },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  logger.error(err)
  res.status(err.code || 500).json({ error: err.message || err.toString() })
})

app.listen(PORT, async () => {
  dishReader.loadData(dataDir)
  await store.replay()
  logger.info(`Listening on http://localhost:${PORT} (NODE_ENV=${nodeEnv})`)
})

console.log(listRoutes(app))
