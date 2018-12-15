/* eslint-env node, mocha */

const should = require('should')
const EventStore = require('./EventStore')
const path = require('path')
const mock = require('mock-fs')
const fs = require('fs')
const YAML = require('yaml')

describe('EventStore', () => {
  afterEach(() => mock.restore())

  it('should load initial data when no events.json file exist', () => {
    const events = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])
    mock({testdata: {'events-initial.json': events}})
    const basePath = path.join(process.cwd(), 'testdata')
    const store = new EventStore({basePath})
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 1, name: 'Test dish'}])
    fs.existsSync(path.join(basePath, 'events.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'events.json')).toString().should.equal(events)
  })

  it('should ignore initial data when events.json already exist', () => {
    const initial = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])
    const events = JSON.stringify([{type: 'dish-added', id: 2, name: 'Test dish 2'}])
    mock({testdata: {'events-initial.json': initial, 'events.json': events}})
    const basePath = path.join(process.cwd(), 'testdata')
    const store = new EventStore({basePath})
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 2, name: 'Test dish 2'}])
    fs.existsSync(path.join(basePath, 'events.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'events.json')).toString().should.equal(events)
  })

  it('should replay events on startup', () => {
    const events = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])
    mock({testdata: {'events.json': events}})
    const basePath = path.join(process.cwd(), 'testdata')
    const store = new EventStore({basePath})
    store.getEvents().should.deepEqual([{type: 'dish-added', id: 1, name: 'Test dish'}])
  })

  it('should apply changes', () => {
    const events = JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}])
    const changes = YAML.stringify([{command: 'add-dish', name: 'Test dish 2'}])
    mock({testdata: {'events.json': events, changes: {'1.yaml': changes}}})
    const basePath = path.join(process.cwd(), 'testdata')
    const store = new EventStore({basePath})
    let commandIsExecuted = false
    store.applyChanges(command => {
      command.should.deepEqual({command: 'add-dish', name: 'Test dish 2'})
      commandIsExecuted = true
    })
    commandIsExecuted.should.be.true()
    fs.existsSync(path.join(basePath, 'state.json')).should.be.true()
    fs.readFileSync(path.join(basePath, 'state.json')).toString().should.equal('{"changesRead":1}')
  })

  it('should ignore changes which are already handled', () => {
    mock({testdata: {
        'events.json': JSON.stringify([{type: 'dish-added', id: 1, name: 'Test dish'}]),
        'state.json': '{"changesRead":1}',
        changes: {
          '1.yaml': YAML.stringify([{command: 'add-dish', name: 'Test dish 2'}])
        }
      }})
    const basePath = path.join(process.cwd(), 'testdata')
    const store = new EventStore({basePath})
    store.applyChanges(() => should('command applied').fail())
  })
})
