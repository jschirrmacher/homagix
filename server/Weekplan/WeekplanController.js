export default ({ models, store, proposer }) => {
  function getWeekplan(user, startingAt, inhibited, today) {
    today = today || new Date()
    today.setHours(0, 0, 0, 0)
    const history = Object.assign({}, ...models.dishHistory
      .getFrom(user, startingAt)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 7)
      .map(([date, dishId]) => ({ [date]: models.dish.byId(dishId) }))
    )
    const proposals = proposer.get(user, inhibited)
    return Array(7).fill(0).map((_, index) => {
      const date = new Date(+new Date(startingAt) + 86400000 * index).toISOString().split('T')[0]
      const dish = history[date] || (new Date(date) >= today ? proposals.shift() : {})
      return { date, dish, served: !!history[date] }
    })
  }

  function fixPlan(user, date, accepted) {
    accepted.forEach((id, index) => {
      const newDate = new Date(date)
      newDate.setDate(newDate.getDate() + index)
      store.emit(models.getEvents().served(id, newDate, user.listId || user.id))
    })
    return { accepted, date }
  }

  return {
    getWeekplan,
    fixPlan,
  }
}
