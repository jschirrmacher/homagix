/* eslint-env node, mocha */

const should = require('should')
const EventStore = require('./EventStore')
const path = require('path')
const fs = require('fs')

const basePath = path.resolve(__dirname, 'testdata')
const migrationsPath = path.join(basePath, 'migrations')
const changes_1js = `module.exports = function(e) { e({command: 'add-dish', name: 'Test dish 2'}) }`
const events = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])

describe('EventStore', () => {
  beforeEach(() => {
    fs.rmdirSync(basePath, { recursive: true })
    fs.mkdirSync(basePath)
  })

  afterEach(() => fs.rmdirSync(basePath, { recursive: true }))

  it('should load initial data when no events.json file exist', () => {
    fs.writeFileSync(path.join(basePath, 'events-initial.json'), events)
    const store = new EventStore({ basePath })
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 1, name: 'Test dish'}])
    fs.existsSync(path.join(basePath, 'events.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'events.json')).toString().should.equal(events)
  })

  it('should ignore initial data when events.json already exist', () => {
    const initial = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])
    const events = JSON.stringify([{type: 'dish-added', id: 2, name: 'Test dish 2'}])
    fs.writeFileSync(path.join(basePath, 'events.json'), events)
    fs.writeFileSync(path.join(basePath, 'events-initial.json'), initial)
    const store = new EventStore({ basePath})
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 2, name: 'Test dish 2'}])
    fs.existsSync(path.join(basePath, 'events.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'events.json')).toString().should.equal(events)
  })

  it('should replay events on startup', () => {
    fs.writeFileSync(path.join(basePath, 'events.json'), events)
    const store = new EventStore({basePath})
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 1, name: 'Test dish'}])
  })

  it(`should do nothing when applyChanges() is called and no 'migrations' folder exist`, () => {
    fs.writeFileSync(path.join(basePath, 'events.json'), events)
    const store = new EventStore({ basePath, migrationsPath })
    store.applyChanges(() => {})
  })

  it('should apply migrations', () => {
    fs.writeFileSync(path.resolve(basePath, 'events.json'), events)
    fs.mkdirSync(migrationsPath)
    fs.writeFileSync(path.resolve(migrationsPath, '1.js'), changes_1js)
    const store = new EventStore({basePath, migrationsPath})
    let commandIsExecuted = false
    store.applyChanges(command => {
      command.should.deepEqual({command: 'add-dish', name: 'Test dish 2'})
      commandIsExecuted = true
    })
    commandIsExecuted.should.be.true()
    fs.existsSync(path.join(basePath, 'state.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'state.json')).toString().should.equal('{"changesRead":1}')
  })

  it('should ignore migrations which are already handled', () => {
    fs.writeFileSync(path.resolve(basePath, 'events.json'), events)
    fs.writeFileSync(path.resolve(basePath, 'state.json'), '{"changesRead":1}')
    fs.mkdirSync(migrationsPath)
    fs.writeFileSync(path.resolve(migrationsPath, '1.js'), changes_1js)
    const store = new EventStore({basePath})
    store.applyChanges(() => should('command applied').fail())
  })
})
