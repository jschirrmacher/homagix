/* eslint-env node, mocha */

import should from 'should'
import path from 'path'
import fs from 'fs'
import EventStore, { Store } from './EventStore'
import logger from '../lib/MockLogger'
import MockFS from '../lib/MockFS'

const DIRNAME = path.resolve(path.dirname(''), 'server', 'EventStore')
const basePath = path.resolve(DIRNAME, 'testdata')
const migrationsPath = path.join(basePath, 'migrations')
const changes_1js = fs
  .readFileSync(path.resolve(DIRNAME, 'testMigrator.ts'))
  .toString()
const events =
  JSON.stringify({ type: 'testEvent', id: 1, name: 'Test event' }) + '\n'
const mockFS = MockFS({ basePath, logger })

function testEvent(data?: unknown[]) {
  return { type: 'testEvent', ...data }
}

let store: Store

describe('EventStore', () => {
  beforeEach(() => {
    logger.reset()
  })

  afterEach(() => {
    store && store.end()
    logger.log.should.deepEqual([])
    mockFS.cleanup()
  })

  it('should replay events on startup', async () => {
    mockFS.setupFiles({ 'events-0.json': events })
    store = EventStore({ basePath, migrationsPath })
    const eventList = [] as unknown[]
    store.on(testEvent, (event: unknown) => eventList.push(event))
    await store.replay()
    eventList.should.deepEqual([
      { type: 'testEvent', id: 1, name: 'Test event' },
    ])
  })

  it('should apply migrations', async () => {
    mockFS.setupFiles({
      'events-0.json': events,
      'migrations/1.js': changes_1js,
    })
    store = EventStore({ basePath, migrationsPath, logger })
    const eventList = [] as unknown[]
    store.on(testEvent, (event: unknown) => eventList.push(event))
    await store.replay()
    eventList.length.should.equal(1)
    eventList[0].should.containDeep({
      type: 'testEvent',
      name: 'Migrated event',
    })
    fs.existsSync(path.join(basePath, 'state.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'state.json'))
      .toString()
      .should.equal('{"versionNo":1}')
    logger.log.should.deepEqual([
      ['info', 'Migrating data from 0 to 1'],
      ['info', 'Migration successful'],
    ])
    logger.reset()
  })

  it('should ignore migrations which are already handled', async () => {
    mockFS.setupFiles({
      'events-0.json': events,
      'state.json': '{"versionNo":1}',
      'migrations/1.js': changes_1js,
    })
    store = EventStore({ basePath, migrationsPath, logger })
    store.on(testEvent, should({}).fail())
    await store.replay()
  })

  it('should deliver events', async () => {
    store = EventStore({ basePath, migrationsPath })
    let delivered = false
    store.on(testEvent, () => (delivered = true))
    await store.replay()
    await store.emit(testEvent())
    delivered.should.be.true()
  })

  it('should use additional event data', async () => {
    store = EventStore({ basePath, migrationsPath })
    let data
    store.on(testEvent, (event: unknown) => (data = event))
    await store.replay()
    await store.emit(testEvent({ additional: 123 }))
    data.should.containDeep({ additional: 123 })
  })
})
