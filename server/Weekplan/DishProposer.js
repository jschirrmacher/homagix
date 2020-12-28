export default ({ models, store, events }) => {
  function getDate(dish) {
    return new Date(dish.last || 0)
  }

  return {
    get(inhibited = []) {
      return models.dish.getAll()
        .filter(dish => !dish.alwaysOnList)
        .filter(dish => !inhibited.some(id => id === dish.id))
        .sort((a, b) => getDate(a) - getDate(b))
        .slice(0, 7)
    },
  
    fix(accepted, date) {
      accepted.forEach((id, index) => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + index)
        store.emit(events.served(id, newDate))
      })
      return { accepted, date }
    }
  }
}
