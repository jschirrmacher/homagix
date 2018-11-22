/*eslint-env node*/

const express = require('express')
const bodyParser = require('body-parser')
const DishProposer = require('./DishProposer')
const Model = require('./Model')
const model = new Model()

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const proposer = new DishProposer({model})

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.path) // eslint-disable-line no-console
  next()
})

app.get('/proposals', async (req, res) => res.json(await proposer.get(req.body)))

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`) // eslint-disable-line no-console
})
