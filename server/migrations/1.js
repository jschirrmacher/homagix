module.exports = function (commandExecutor) {
  commandExecutor({
    command: 'add-ingredient-to-dish',
    dish: 'Wraps',
    ingredient: 'Geriebener Käse',
    amount: 100,
    unit: 'g'
  })
  commandExecutor({
    command: 'add-ingredient-to-dish',
    dish: 'Wraps',
    ingredient: 'Kidney Bohnen',
    amount: 1,
    unit: 'Dose'
  })
  commandExecutor({
    command: 'add-ingredient-to-dish',
    dish: 'Wraps',
    ingredient: 'Mais',
    amount: 1,
    unit: 'Dose'
  })
}

