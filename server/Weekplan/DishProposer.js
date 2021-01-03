export default ({ models }) => {
  return {
    get(user, inhibited = []) {
      const favorites = models.dishList.getById(user.listId || user.id) || []
      function getDate(dish) {
        return new Date(dish.last || 0)
      }
    
      function compare(a, b) {
        const aIsFav = favorites.includes(a.id)
        const bIsFav = favorites.includes(b.id)
        if (aIsFav && !bIsFav) {
          return -1
        } else if (!aIsFav && bIsFav) {
          return 1
        } else {
          return getDate(a) - getDate(b)
        }
      }
    
      return models.dish.getAll().filter(dish => !dish.alwaysOnList)
        .filter(dish => !inhibited.some(id => id === dish.id))
        .sort(compare)
        .slice(0, 7)
    },
  }
}
