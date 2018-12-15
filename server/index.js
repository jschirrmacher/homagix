/*eslint-env node*/

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const DishProposer = require('./DishProposer')
const logger = console
const EventStore = require('./EventStore')
const Model = require('./Model')

const eventStore = new EventStore({basePath: path.join(__dirname, '..', 'data'), logger})
const model = new Model({eventStore, logger})

const PORT = process.env.PORT || 8080

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const proposer = new DishProposer({model})

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.get('/proposals', async (req, res) => res.json(await proposer.get(
  getIntArrayParam(req.query, 'inhibit'),
  getIntArrayParam(req.query, 'accepted')
)))
app.post('/proposals/fix', async (req, res) => res.json(await proposer.fix(req.body.accepted, new Date(req.body.date))))
app.use('/', express.static(path.join(__dirname, '..', 'build')))

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`)
})

function getIntArrayParam(params, name) {
  return ((params[name] && params[name].split(',')) || []).map(n => parseInt(n))
}
