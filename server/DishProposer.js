module.exports = ({ models, store, Events }) => {
  function addIfNotAlreadyIn(array, element) {
    const existing = array.findIndex(el => el.id === element.id)
    if (existing !== -1) {
      if (array[existing].unit !== element.unit) {
        throw Error(`Problem: ingredient '${element.name}' is specified with different units!`)
      }
      array[existing].amount += element.amount
      return array
    } else {
      return [...array, element]
    }
  }
  
  function getActualIngredient(entry) {
    const id = entry.id
    const ingredient = models.ingredient.byId(id) || { name: 'Unbekannte Zutat #' + id }
    return Object.assign({id, amount: entry.amount, unit: entry.unit}, ingredient)
  }

  return {
    get(inhibited = [], accepted = []) {
      const dishes = models.dish.getAll()
        .filter(dish => !inhibited.some(id => id === +dish.id))
        .sort((a, b) => new Date(a.last) - new Date(b.last))
        .slice(0, 7)
      const ingredients = dishes
        .filter(dish => accepted.some(id => id === dish.id))
        .map(dish => dish.ingredients)                                // get ingredients for each accepted dish
        .reduce((acc, sub) => acc.concat(sub), [])                    // flatten list
        .map(getActualIngredient)
        .reduce(addIfNotAlreadyIn, [])
  
      return {dishes, ingredients}
    },
  
    fix(accepted, date) {
      accepted.forEach((id, index) => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + index)
        store.emit(Events.served(id, newDate))
      })
      return { accepted, date }
    }
  }
}
