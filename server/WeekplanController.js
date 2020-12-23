export default ({ models, proposer }) => {
  function getNextDate(plan) {
    const maxDate = plan.length && plan.reduce((max, current) => current.date > max ? current.date : max, '0000-00-00')
    if (maxDate) {
      const date = new Date(maxDate)
      date.setDate(date.getDate() + 1)
      return date
    }
    return null
  }

  function getWeekplan(startingAt, inhibited, today) {
    today = today || new Date()
    today.setHours(0, 0, 0, 0)
    const history = models.dishHistory
      .getFrom(startingAt)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, dishId]) => ({ date, dish: models.dish.byId(dishId), served: true }))
      .slice(0, 7)
    const proposals = proposer.get(inhibited)
    const plan = history
    while (plan.length < 7) {
      const date = getNextDate(plan) || new Date(startingAt)
      const dish = date >= today ? proposals.shift() : {}
      plan.push({ date: date.toISOString().split('T')[0], dish, served: false })
    }
    return plan
  }

  return {
    getWeekplan,
  }
}
