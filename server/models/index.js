const { readdirSync } = require('fs')

module.exports = function ({ store }) {
  const models = {}
  const Events = require('../events')({ models })

  function requireReader(name) {
    if (!models[name]) {
      const model = require('./' + name)({ store, Events })
      if (model.dependencies) {
        model.dependencies.forEach(requireReader)
      }
      models[name] = model
    }
  }

  readdirSync(__dirname)
    .map(name => name.replace('.js', ''))
    .filter(name => !name.endsWith('.test'))
    .filter(name => name !== 'index')
    .forEach(requireReader)

  return models
}
