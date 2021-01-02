/*eslint-env mocha*/
import should from 'should'
import Events from '../EventStore/Events.js'
import User from './user.js'

const storeListener = {}
const store = {
  on(event, handler) {
    storeListener[event.name] = handler
  },

  async emit(type, ...args) {
    const event = type(...args)
    storeListener[event.type](event)
  }
}

const testPerson = {
  id: '4711',
  email: 'test@example.com',
  firstName: 'Tom',
}

const modelWriter = {
  writeUser() {}
}

const models = {}
models.user = User({ models, store, modelWriter })

const { userAdded } = models.getEvents()

describe('Models.user', () => {
  beforeEach(() => models.user.reset())

  it('should retrieve all users', () => {
    store.emit(userAdded, testPerson)
    models.user.getAll().should.deepEqual([testPerson])
  })

  it('should retrieve a single user by id', () => {
    store.emit(userAdded, testPerson)
    models.user.getById('4711').should.deepEqual(testPerson)
  })

  it('should throw if a user is not found by id', () => {
    store.emit(userAdded, testPerson)
    should(() => models.user.getById('666')).throw(`User '666' doesn't exist`)
  })

  it('should retrieve a single user by email', () => {
    store.emit(userAdded, testPerson)
    models.user.getByEMail('test@example.com').should.deepEqual(testPerson)
  })

  it('should throw if a user is not found by email', () => {
    store.emit(userAdded, testPerson)
    should(() => models.user.getByEMail('unknown@example.com')).throw(`No user found with this e-mail address`)
  })
})
