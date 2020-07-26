/* eslint-env node, mocha */

const should = require('should')
const EventStore = require('./EventStore')
const path = require('path')
const fs = require('fs')

const basePath = path.resolve(__dirname, 'testdata')
const migrationsPath = path.join(basePath, 'migrations')
const changes_1js = fs.readFileSync(path.resolve(__dirname, 'testMigrator.js')).toString()
const events = JSON.stringify({type: 'testEvent', id: 1, name: 'Test event'}) + '\n'

function testEvent(data) {
  return { type: 'testEvent', ...data }
}

function rmDataFolder() {
  fs.rmdirSync(basePath, { recursive: true })
  fs.rmdirSync(migrationsPath, { recursive: true })
}

function setupFiles(list) {
  Object.entries(list).forEach(([location, content]) => {
    fs.writeFileSync(path.resolve(basePath, location), content)
  })
}

const logger = {
  info() {}
}

describe('EventStore', () => {
  beforeEach(() => {
    rmDataFolder()
    fs.mkdirSync(basePath)
    fs.mkdirSync(migrationsPath)
  })

  afterEach(rmDataFolder)

  it('should replay events on startup', async () => {
    setupFiles({'events-0.json': events})
    const store = EventStore({ basePath, migrationsPath })
    const eventList = []
    store.on(testEvent, event => eventList.push(event))
    await store.replay()
    eventList.should.deepEqual([{type: 'testEvent', id: 1, name: 'Test event'}])
  })

  it('should apply migrations', async () => {
    setupFiles({
      'events-0.json': events,
      'migrations/1.js': changes_1js
    })
    const store = EventStore({ basePath, migrationsPath, logger })
    const eventList = []
    store.on(testEvent, event => eventList.push(event))
    await store.replay()
    eventList.length.should.equal(1)
    eventList[0].should.containDeep({type: 'testEvent', name: 'Migrated event'})
    fs.existsSync(path.join(basePath, 'state.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'state.json')).toString().should.equal('{"versionNo":1}')
  })

  it('should ignore migrations which are already handled', async () => {
    setupFiles({
      'events-0.json': events,
      'state.json': '{"versionNo":1}',
      'migrations/1.js': changes_1js
    })
    const store = EventStore({ basePath, migrationsPath, logger })
    store.on(testEvent, should().fail)
    await store.replay()
  })

  it('should deliver events', async () => {
    const store = EventStore({ basePath, migrationsPath })
    let delivered = false
    store.on(testEvent, () => delivered = true)
    await store.replay()
    await store.emit(testEvent())
    delivered.should.be.true()
  })

  it('should use additional event data', async () => {
    const store = EventStore({ basePath, migrationsPath })
    let data
    store.on(testEvent, event => data = event)
    await store.replay()
    await store.emit(testEvent({ additional: 123 }))
    data.should.containDeep({ additional: 123 })
  })
})
