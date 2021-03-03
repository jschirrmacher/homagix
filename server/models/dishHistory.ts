import { Models } from '.'
import { Event, Store } from '../EventStore/EventStore'
import { User } from './user'

export type HistoryModel = {
  getFrom(user: User, date: string): string[][]
}

type HistoryEntry = Record<string, string>
const history = {} as Record<string, HistoryEntry>

function served(event: Event): void {
  const { dishId, date, listId = '' } = event as {
    dishId: string
    date: string
    listId?: string
  }
  history[listId] = history[listId] || {}
  history[listId][date] = dishId
}

function getFrom(user: User, date: string) {
  const ownHistory = history[user.listId || user.id] || {}
  const commonHistory = history[''] || {}
  const list = { ...ownHistory, ...commonHistory }
  return Object.entries(list).filter(([d]) => d >= date)
}

export default function ({
  store,
  models,
}: {
  store: Store
  models: Models
}): HistoryModel {
  store.on(models.dish.events.served, served)

  return {
    getFrom,
  }
}
