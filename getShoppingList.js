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
    return dish.ingredients
  }))
  .map(ingredient => ingredient.match(/^(.*?)\s+(.*?)\s+(.*)/))
  .map(parts => {
    const amount = +parts[1].replace(',', '.')
    return {amount, unit: parts[2], name: parts[3]}
  })

const combinedList = {}
list.forEach(ingredient => {
  if (combinedList[ingredient.name]) {
    if (combinedList[ingredient.name].unit === ingredient.unit) {
      combinedList[ingredient.name].amount += ingredient.amount
    } else {
      console.error(`Problem: ingredient '${ingredient.name}' is specified with different units!`)
    }
  } else {
    combinedList[ingredient.name] = ingredient
  }
})

const shoppingList = Object.keys(combinedList).map(index => {
  return ('' + combinedList[index].amount).replace('.', ',') + ' ' + combinedList[index].unit + ' ' + index
})

console.log(shoppingList.join('\n'))
