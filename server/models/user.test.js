/*eslint-env mocha*/
import should from 'should'
import Store from '../EventStore/Store.mock.js'
import User from '../models/user.js'
import Events from '../EventStore/Events.js'

const store = Store()
const models = {}
const events = Events({ models })
models.user = User({ store, events, modelWriter: { writeUser() {} }})

const testPerson = {
  id: '4711',
  email: 'test@example.com',
  firstName: 'Tom',
}

const { userAdded } = events

describe('Models.user', () => {
  beforeEach(() => models.user.reset())

  it('should retrieve all users', () => {
    store.emit(userAdded(testPerson))
    models.user.getAll().should.deepEqual([testPerson])
  })

  it('should retrieve a single user by id', () => {
    store.emit(userAdded(testPerson))
    models.user.getById('4711').should.deepEqual(testPerson)
  })

  it('should throw if a user is not found by id', () => {
    store.emit(userAdded(testPerson))
    should(() => models.user.getById('666')).throw(`User '666' doesn't exist`)
  })

  it('should retrieve a single user by email', () => {
    store.emit(userAdded(testPerson))
    models.user.getByEMail('test@example.com').should.deepEqual(testPerson)
  })

  it('should throw if a user is not found by email', () => {
    store.emit(userAdded(testPerson))
    should(() => models.user.getByEMail('unknown@example.com')).throw(`No user found with this e-mail address`)
  })
})
