/*eslint-env node*/

const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const pathToStorage = path.join(__dirname, '..', 'Homagix', 'Homagix.Server', 'Data', 'speisen.yaml')
const data = YAML.parse(fs.readFileSync(pathToStorage).toString())
const dishes = data.dishes.sort((a, b) => new Date(a.last) - new Date(b.last))

class Model {
  getDishes(num) {
    return dishes.slice(0, num)
  }
}

module.exports = Model
