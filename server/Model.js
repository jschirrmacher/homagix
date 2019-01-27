/*eslint-env node*/

function camelize(string) {
  return string.charAt(0).toUpperCase() + string.substr(1)
}

function byId(id) {
  return el => el.id === id
}

function byName(name) {
  return el => el.name === name
}

class Model {
  constructor(options = {}) {
    this.eventStore = options.eventStore
    this.logger = options.logger || console
    this.viewModels = {
      dish: [],
      ingredient: []
    }
    this.inReplay = true
    options.eventStore.getEvents().forEach(event => this.handleEvent(event, true))
    this.eventStore.applyChanges(this.executeCommand.bind(this))
    this.inReplay = false
  }

  executeCommand(command, index) {
    try {
      switch (command.command) {
        case 'add-ingredient-to-dish': {
          const dish = this.findElement('dish', byName(command.dish))
          const ingredient =
            this.findElement('ingredient', byName(command.ingredient), true) ||
            this.createElement('ingredient', {name: command.ingredient})
          const event = {
            type: 'ingredient-assigned',
            dish: dish.id,
            ingredient: ingredient.id,
            amount: command.amount,
            unit: command.unit
          }
          this.eventStore.add(event)
          this.handleEvent(event)
          break
        }

        default:
          // noinspection ExceptionCaughtLocallyJS
          throw Error(`invalid command`)
      }
    } catch (e) {
      this.logger.error(`${e.message} - command #${index + 1} '${command.command}' ignored`)
    }
  }

  findElement(type, how, dontThrow = false) {
    const el = this.viewModels[type].find(how)
    if (!el && !dontThrow) {
      throw Error(`${camelize(type)} not found`)
    }
    return el
  }

  createElement(type, data) {
    const makeListener = type => {
      return {
        set: (obj, name, value) => {
          obj[name] = value
          if (!this.inReplay) {
            const event = {type: type + '-updated', id: obj.id, name, value}
            this.eventStore.add(event)
          }
          return true
        }
      }
    }

    if (this.viewModels[type].find(byName(data.name))) {
      throw Error(`${camelize(type)} '${data.name}' already exists`)
    }
    data.id = data.id || Math.max(...this.viewModels[type].map(el => el.id))
    const el = new Proxy(data, makeListener(type))
    this.viewModels[type].push(el)
    if (!this.inReplay) {
      this.eventStore.add(Object.assign({type: type + '-added'}, el))
    }
    return el
  }

  handleEvent(event) {
    const type = event.type
    const data = Object.assign({}, event)
    delete data.type
    try {
      switch (type) {
        case 'dish-added':
          this.createElement('dish', data)
          break

        case 'ingredient-added':
          this.createElement('ingredient', data)
          break

        case 'ingredient-assigned': {
          const dish = this.findElement('dish', byId(data.dish))
          delete data.dish
          dish.ingredients = dish.ingredients || []
          dish.ingredients.push(data)
          break
        }

        case 'dish-updated':
          this.findElement('dish', byId(data.id))[data.name] = data.value
          break

        case 'ingredient-updated':
          this.findElement('ingredient', byId(data.id))[data.name] = data.value
          break
      }
    } catch (e) {
      this.logger.error(`${e.message} - ${type} event ignored`)
    }
  }

  persistChanges() {
    this.eventStore.persistChanges()
  }

  getDishes() {
    return this.viewModels.dish
  }

  getDish(id) {
    return this.viewModels.dish.find(dish => dish.id === id)
  }

  getIngredients() {
    return this.viewModels.ingredient
  }

  getIngredient(id) {
    return this.viewModels.ingredient.find(ingredient => ingredient.id === id)
  }
}

module.exports = Model
