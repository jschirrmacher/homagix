import { Event, EventType, Listener } from './EventStore'

export default () => {
  const listeners = {} as Record<string, Listener[]>
  const eventList = [] as Event[]

  return {
    eventList() {
      return eventList
    },

    on(type: EventType, func: Listener) {
      listeners[type.name] = listeners[type.name] || []
      listeners[type.name].push(func)
      return this
    },

    dispatch(event: Event) {
      eventList.push(event)
      ;(listeners[event.type] || []).forEach(listener => listener(event))
    },

    async emit(event: Event) {
      this.dispatch(event)
    },

    async replay() {
      //
    },

    end() {
      //
    },
  }
}
