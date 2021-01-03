export default () => {
  const listeners = {}
  const eventList = []

  return {
    eventList() {
      return eventList
    },

    on(type, func) {
      listeners[type.name] = listeners[type.name] || []
      listeners[type.name].push(func)
      return this
    },
    
    dispatch(event) {
      eventList.push(event)
      ;(listeners[event.type] || []).forEach(listener => listener(event))
    },
  
    emit(event) {
      this.dispatch(event)
    }
  }
}
