import Events from '../Events.js'

export default function ({ store, models, modelWriter }) {
  const { userAdded, userRemoved, userChanged } = Events({ models })
  const byEmail = {}
  const users = {}
  let adminIsDefined = false

  
  store.on(userAdded, event => {
    users[event.user.id] = event.user
    if (event.user.email) {
      byEmail[event.user.email] = event.user
    }
    if (event.user.isAdmin) {
      adminIsDefined = true
    }
    modelWriter.writeUser(event.user)
  })

  store.on(userRemoved, event => {
    delete(byEmail[users[event.id].email])
    delete(users[event.id])
    modelWriter.removeUser(event.id)
  })

  store.on(userChanged, event => {
    if (event.user.email && users[event.id].email && byEmail[users[event.id].email]) {
      delete(byEmail[users[event.id].email])
    }
    Object.assign(users[event.user.id], event.user)
    if (event.user.email) {
      byEmail[event.user.email] = users[event.user.id]
    }
    modelWriter.writeUser(event.user)
  })

  return {
    getAll() {
      return Object.values(users)
    },

    getById(userId) {
      const user = users[userId]
      if (user) {
        return user
      }
      throw Error(`User '${userId}' doesn't exist`)
    },

    getByAccessCode() {
      throw Error(`No user found with this access code`)
    },

    getByEMail(email, throwIfNotFound = true) {
      const user = byEmail[email]
      if (user || !throwIfNotFound) {
        return user
      }
      throw Error(`No user found with this e-mail address`)
    },

    adminIsDefined,

    reset() {
      function clear(obj) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj,key)) {
            delete obj[key]
          }
        }
      }
      clear(byEmail)
      clear(users)
    }
  }
}
