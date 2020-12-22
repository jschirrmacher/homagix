export default ({ models, proposer }) => {

  function getWeekplan(startingAt, inhibited) {
    const history = models.dishHistory
      .getFrom(startingAt)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, dishId]) => ({ date, dish: models.dish.byId(dishId), served: true }))
      .slice(0, 7)
    const proposals = proposer.get(inhibited)
    const plan = history
    while (plan.length < 7) {
      const maxDate = plan.length && plan.reduce((max, current) => current.date > max ? current.date : max, '0000-00-00') || startingAt
      const date = new Date(maxDate)
      date.setDate(date.getDate() + 1)
      plan.push({ date: date.toISOString().split('T')[0], dish: proposals.shift(), served: false })
    }
    return plan
  }

  return {
    getWeekplan,
  }
}
