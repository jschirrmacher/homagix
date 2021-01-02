export default ({ models, store }) => {
  function getDate(dish) {
    return new Date(dish.last || 0)
  }

  return {
    get(user, inhibited = []) {
      return (models.dishList.getById(user.id) || [])
        .filter(dishId => !inhibited.some(id => id === dishId))
        .map(dishId => models.dish.getDishById(dishId))
        .sort((a, b) => getDate(a) - getDate(b))
        .slice(0, 7)
    },
  
    fix(accepted, date) {
      accepted.forEach((id, index) => {
        const newDate = new Date(date)
        newDate.setDate(newDate.getDate() + index)
        store.emit(models.getEvents().served(id, newDate))
      })
      return { accepted, date }
    }
  }
}
