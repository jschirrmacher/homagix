module.exports = ({ models, store, Events }) => {
  return {
    get(inhibited = []) {
      const dishes = models.dish.getAll()
        .filter(dish => !inhibited.some(id => id === +dish.id))
        .sort((a, b) => new Date(a.last) - new Date(b.last))
        .slice(0, 7)
  
      return {dishes}
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
