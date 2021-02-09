import { Models } from '.'
import { Event, Store } from '../EventStore/EventStore'
import { ModelWriter } from './ModelWriter'

export type User = {
  id: string
  firstName: string
  email: string
  listId?: string
  isAdmin?: boolean
}

export type UserModel = {
  getAll(): User[]
  getById(userId: string): User
  getByEMail(email: string, throwIfNotFound?: boolean): User
  adminIsDefined: boolean
  reset(): void
}

export default function ({
  store,
  models,
  modelWriter,
}: {
  store: Store
  models: Models
  modelWriter: ModelWriter
}): UserModel {
  const {
    userAdded,
    userRemoved,
    userChanged,
    invitationAccepted,
  } = models.getEvents()
  const byEmail = {} as Record<string, User>
  const users = {} as Record<string, User>
  let adminIsDefined = false

  store.on(userAdded, (event: Event) => {
    const { user } = event as { user: User }
    users[user.id] = user
    if (user.email) {
      byEmail[user.email] = user
    }
    if (user.isAdmin) {
      adminIsDefined = true
    }
    modelWriter.writeUser(user)
  })

  store.on(userRemoved, (event: Event) => {
    const { id } = event as { id: string }
    delete byEmail[users[id].email]
    delete users[id]
    modelWriter.removeUser(id)
  })

  store.on(userChanged, (event: Event) => {
    const { id, user } = event as { id: string; user: Partial<User> }
    if (user.email && users[id].email && byEmail[users[id].email]) {
      delete byEmail[users[id].email]
    }
    Object.assign(users[id], { ...user, id })
    if (user.email) {
      byEmail[user.email] = users[id]
    }
    modelWriter.writeUser(users[id])
  })

  store.on(invitationAccepted, (event: Event) => {
    const { userId, listId } = event as { userId: string; listId: string }
    users[userId].listId = listId
    modelWriter.writeUser(users[userId])
  })

  return {
    getAll() {
      return Object.values(users)
    },

    getById(userId: string) {
      const user = users[userId]
      if (user) {
        return user
      }
      throw Error(`User '${userId}' doesn't exist`)
    },

    getByEMail(email: string, throwIfNotFound = true) {
      const user = byEmail[email]
      if (user || !throwIfNotFound) {
        return user
      }
      throw Error(`No user found with this e-mail address`)
    },

    adminIsDefined,

    reset() {
      function clear(obj: Record<string, unknown>) {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            delete obj[key]
          }
        }
      }
      clear(byEmail)
      clear(users)
    },
  }
}
