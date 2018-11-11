const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const pathToStorage = path.join(__dirname, 'Homagix', 'Homagix.Server', 'Data', 'speisen.yaml')
const data = YAML.parse(fs.readFileSync(pathToStorage).toString())
const weekNames = Object.keys(data.weeks)
if (process.argv.length < 3 || weekNames.indexOf(process.argv[2]) < 0) {
  throw Error(`Usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} <week>
with <week> one of "${weekNames.join('", "')}"`)
}
const week = process.argv[2]

const list = []
  .concat(...data.weeks[week].map(dishId => {
    const dish = data.dishes.find(dish => dish.id === dishId)
    return dish.name
  }))

console.log(list.join('\n'))
