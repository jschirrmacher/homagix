import { config } from 'dotenv-flow'
config()
import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import Models from './models/index.js'
import EventStore from './EventStore/EventStore.js'
import DishReader from './models/DishReader.js'
import MainRouter from './MainRouter.js'
import Location from './lib/Location.js'
import ModelWriter from './models/ModelWriter.js'
import history from 'connect-history-api-fallback'
import Auth from './auth/auth.js'

const nodeEnv = process.env.NODE_ENV || 'development'
const logger = console
const { DIRNAME } = Location(import.meta.url)

const PORT = process.env.PORT || 8200

const basePath = path.join(DIRNAME, '..', 'data')
const store = EventStore({ basePath, logger })
const modelWriter = ModelWriter({ basePath })
const models = Models({ store, modelWriter })

const dishReader = DishReader({ store, models, basePath })

const app = express()
app.set('json spaces', 2)
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
const auth = Auth({ app, models, store, secretOrKey: process.env.SECRET })
const router = MainRouter({ models, store, auth })

async function setupHotLoading() {
  if (process.env.NODE_ENV === 'development') {
    const webpack = await import('./Webpack.js')
    webpack.setup(app, logger)
  }
}

setupHotLoading()

app.use(history())

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use(router)
app.use('/', express.static(path.join(DIRNAME, '..', 'build')))
app.use('/', express.static(path.join(DIRNAME, '..', 'public')))
app.use('/images', express.static(path.join(DIRNAME, '..', 'data', 'images')))

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(err)
  res.status(err.httpStatus || 500).json({ error: err.message || err.toString() })
})

app.listen(PORT, async () => {
  dishReader.loadData()
  await store.replay()
  logger.info(`Listening on http://localhost:${PORT} (NODE_ENV=${nodeEnv})`)
})
