/*eslint-env node*/

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const DishProposer = require('./DishProposer')
const Model = require('./Model')
const model = new Model()
const logger = console

const PORT = process.env.PORT || 8080

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const proposer = new DishProposer({model})

app.use((req, res, next) => {
  logger.info(req.method + ' ' + req.path)
  next()
})

app.get('/proposals', async (req, res) => res.json(await proposer.get(handleArrayParam(req.query, {inhibit: 'int', accepted: 'int'}))))
app.use('/', express.static(path.join(__dirname, '..', 'build')))

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`)
})

function handleArrayParam(params, types) {
  Object.keys(types).forEach(paramName => {
    params[paramName] = (params[paramName] && params[paramName].split(',')) || []
    if (types[paramName] === 'int') {
      params[paramName] = params[paramName].map(n => parseInt(n))
    }
  })
  return params
}
