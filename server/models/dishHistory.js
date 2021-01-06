const history = {}

function served({ dishId, date, listId = '' }) {
  history[listId] = history[listId] || {}
  history[listId][date] = dishId
}

function getFrom(user, date) {
  const ownHistory = history[user.listId || user.id] || {}
  const commonHistory = history[''] || {}
  const list = { ...ownHistory, ...commonHistory }
  return Object.entries(list).filter(([d]) => d >= date)
}

export default function ({ store, events }) {
  store.on(events.served, served)

  return {
    getFrom,
  }
}
