import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import Models from './models/index.js'
import EventStore from './EventStore/EventStore.js'
import DishReader from './DishReader.js'
import MainRouter from './MainRouter.js'
import ModelWriter from './models/ModelWriter.js'
import history from 'connect-history-api-fallback'
import Auth from './auth/auth.js'
import listRoutes from './lib/listRoutes.js'

const nodeEnv = process.env.NODE_ENV || 'development'
const logger = console
const DIRNAME = path.resolve(path.dirname(''))

const PORT = process.env.PORT || 8200

const basePath = path.join(DIRNAME, 'data')
const store = EventStore({ basePath, logger })
const modelWriter = ModelWriter({ basePath })
const models = Models({ store, modelWriter })

const dishReader = DishReader({ store, models })

const app = express()
app.set('json spaces', 2)
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
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

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use(router)
app.use(history({ verbose: true }))
app.use('/', express.static(path.join(DIRNAME, 'build')))
app.use('/', express.static(path.join(DIRNAME, 'public')))
app.use('/images', express.static(path.join(DIRNAME, 'data', 'images')))

// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  logger.error(err)
  res.status(err.code || 500).json({ error: err.message || err.toString() })
})

app.listen(PORT, async () => {
  dishReader.loadData(basePath)
  await store.replay()
  logger.info(`Listening on http://localhost:${PORT} (NODE_ENV=${nodeEnv})`)
})

console.log(listRoutes(app))
