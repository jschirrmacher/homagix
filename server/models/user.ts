import { Models } from "."
import { Store } from "../EventStore/EventStore"
import { ModelWriter } from "./ModelWriter"

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

export default function ({ store, models, modelWriter }: { store: Store, models: Models, modelWriter: ModelWriter }): UserModel {
  const { userAdded, userRemoved, userChanged, invitationAccepted } = models.getEvents()
  const byEmail = {} as Record<string, User>
  const users = {} as Record<string, User>
  let adminIsDefined = false

  store.on(userAdded, (event: { user: User}) => {
    users[event.user.id] = event.user
    if (event.user.email) {
      byEmail[event.user.email] = event.user
    }
    if (event.user.isAdmin) {
      adminIsDefined = true
    }
    modelWriter.writeUser(event.user)
  })

  store.on(userRemoved, (event: { id: string }) => {
    delete byEmail[users[event.id].email]
    delete users[event.id]
    modelWriter.removeUser(event.id)
  })

  store.on(userChanged, (event: { id: string, user: Partial<User> }) => {
    if (
      event.user.email &&
      users[event.id].email &&
      byEmail[users[event.id].email]
    ) {
      delete byEmail[users[event.id].email]
    }
    Object.assign(users[event.id], { ...event.user, id: event.id })
    if (event.user.email) {
      byEmail[event.user.email] = users[event.id]
    }
    modelWriter.writeUser(users[event.id])
  })

  store.on(invitationAccepted, (event: { userId: string, listId: string }) => {
    users[event.userId].listId = event.listId
    modelWriter.writeUser(users[event.userId])
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
