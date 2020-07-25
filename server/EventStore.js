/*eslint-env node*/

const fs = require('fs')
const path = require('path')

const exists = path => {
  try {
    return fs.existsSync(path)
  } catch (e) {
    return false
  }
}

class EventStore {
  constructor({basePath, migrationsPath, logger}) {
    this.basePath = basePath
    this.logger = logger
    this.migrationsPath = migrationsPath
    if (!exists(path.join(this.basePath, 'events.json'))) {
      fs.copyFileSync(path.join(this.basePath, 'events-initial.json'), path.join(this.basePath, 'events.json'))
    }
    this.events = JSON.parse(fs.readFileSync(path.join(this.basePath, 'events.json')))
    this.newEvents = []
  }

  getEvents() {
    return this.events
  }

  applyChanges(commandExecutor) {
    const stateFileName = path.join(this.basePath, 'state.json')
    const state = exists(stateFileName) ? JSON.parse(fs.readFileSync(stateFileName).toString()) : {}
    const files = exists(this.migrationsPath) ? fs.readdirSync(this.migrationsPath) : []
    files.forEach(file => {
      const changeNo = +file.replace('.js', '')
      if (!state.changesRead || state.changesRead < changeNo) {
        const migrator = require(path.join(this.migrationsPath, file))
        migrator(commandExecutor, this.events)
        state.changesRead = changeNo
      }
    })
    fs.writeFileSync(stateFileName, JSON.stringify(state))
    this.persistChanges()
  }

  add(event) {
    if (!this.inReplay) {
      this.newEvents.push(event)
    }
  }

  persistChanges() {
    this.events.push(...this.newEvents)
    this.newEvents = []
    fs.writeFileSync(path.join(this.basePath, 'events.json'), JSON.stringify(this.events, null, 2))
  }
}

module.exports = EventStore
