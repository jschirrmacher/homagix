const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const data = YAML.parse(fs.readFileSync(path.join(__dirname, 'speisen.yaml')).toString())
if (process.argv.length < 3 || ~~process.argv[2] < 1 || ~~process.argv[2] > data.weeks.length) {
  throw Error(`Usage: ${process.argv[0]} ${process.argv[0]} <week>
with <week> a week number between 1 and ${data.weeks.length}`)
}
const week = process.argv[2] - 1

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
