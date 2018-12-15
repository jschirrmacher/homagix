/*eslint-env node*/

const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

class EventStore {
  constructor({basePath, logger}) {
    this.basePath = basePath
    this.logger = logger
    if (!fs.existsSync(path.join(this.basePath, 'events.json'))) {
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
    const state = fs.existsSync(stateFileName) ? JSON.parse(fs.readFileSync(stateFileName).toString()) : {}
    const files = fs.readdirSync(path.join(this.basePath, 'changes'))
    files.forEach(file => {
      const changeNo = +file.replace('.yaml', '')
      if (!state.changesRead || state.changesRead < changeNo) {
        const fileContent = fs.readFileSync(path.join(this.basePath, 'changes', file)).toString()
        const commands = YAML.parse(fileContent)
        commands.forEach(commandExecutor)
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
