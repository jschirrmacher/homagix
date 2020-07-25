module.exports = function (executor, events) {
  events.forEach(event => {
    if (event.type === 'dish-updated') {
      if (event.name !== 'last') {
        throw Error(`Update of dish's attribute '${event.name}' is not expected`)
      }
      event.type = 'served'
      event.dish = event.id
      event.date = event.value.replace(/T.*$/, '')
      delete event.id
      delete event.name
      delete event.value
    }
  })
}
