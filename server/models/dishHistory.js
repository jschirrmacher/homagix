const history = {}

function served({ dishId, date }) {
  history[date] = dishId
}

function getFrom(date) {
  return Object.entries(history)
    .filter(([d]) => d >= date)
}

export default function ({ store, events }) {
  store
    .on(events.served, served)

  return {
    getFrom,
  }
}
