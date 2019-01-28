/*eslint-env node*/

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const logger = console
const EventStore = require('./EventStore')
const Model = require('./Model')
const DishProposer = require('./DishProposer')

const PORT = process.env.PORT || 8080

const eventStore = new EventStore({basePath: path.join(__dirname, '..', 'data'), logger})
const model = new Model({eventStore, logger})
const proposer = new DishProposer({model})
const ingredientRouter = require('./IngredientRouter')({model})
const proposalsRouter = require('./ProposalsRouter')({model, proposer})

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const webpackConfig = require('../config/webpack.conf')
  const compiler = webpack(webpackConfig)
  app.use(require('webpack-dev-middleware')(compiler, {logger, publicPath: webpackConfig.output.publicPath}))
  app.use(require("webpack-hot-middleware")(compiler, {logger, path: '/__webpack_hmr', heartbeat: 10 * 1000}))
}

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.use('/ingredients', ingredientRouter)
app.use('/proposals', proposalsRouter)
app.use('/', express.static(path.join(__dirname, '..', 'build')))
app.use('/', express.static(path.join(__dirname, '..', 'public')))

app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
  logger.error(err)
  res.status(500).json({error: err.toString()})
})

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV})`)
  })
}
