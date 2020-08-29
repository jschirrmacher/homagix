import path from 'path'
import express from 'express'
import bodyParser from 'body-parser'
import Models from './Models/index.js'
import EventStore from './EventStore.js'
import DishReader from './DishReader.js'
import MainRouter from './MainRouter.js'
import Location from './Location.js'

const nodeEnv = process.env.NODE_ENV || 'development'
const logger = console
const { DIRNAME } = Location(import.meta.url)

const PORT = process.env.PORT || 8200

const basePath = path.join(DIRNAME, '..', 'data')
const store = EventStore({ basePath, logger })
const models = Models({ store })

const dishReader = DishReader({ store, models, basePath })
const router = MainRouter({ models, store })

const app = express()
app.set('json spaces', 2)
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'development') {
  const webpack =import('webpack')
  const webpackConfig = import('../config/webpack.conf.cjs')
  const compiler = webpack(webpackConfig)
  app.use(import('webpack-dev-middleware')(compiler, {logger, publicPath: webpackConfig.output.publicPath}))
  app.use(import("webpack-hot-middleware")(compiler, {logger, path: '/__webpack_hmr', heartbeat: 10 * 1000}))
}

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use(router)
app.use('/', express.static(path.join(DIRNAME, '..', 'build')))
app.use('/', express.static(path.join(DIRNAME, '..', 'public')))

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(err)
  res.status(500).json({error: err.toString()})
})

dishReader.loadData()
store.replay()
app.listen(PORT, () => {
  logger.info(`Listening on http://localhost:${PORT} (NODE_ENV=${nodeEnv})`)
})
