/*eslint-env node*/
const fs = require('fs')
const path = require('path')
const YAML = require('yaml')

const currentModelVersion = 1

class ModelStore {
  migrateData() {
    this.data.version = currentModelVersion
  }

  load() {
    const pathToStorage = path.join(__dirname, '..', 'Homagix', 'Homagix.Server', 'Data', 'speisen.yaml')
    this.data = YAML.parse(fs.readFileSync(pathToStorage).toString())

    if (!this.data.version || this.data.version < currentModelVersion) {
      this.migrateData()
      fs.writeFileSync(pathToStorage, YAML.stringify(this.data))
    }
  }

  getData() {
    if (!this.data) {
      this.load()
    }
    return this.data
  }
}

module.exports = ModelStore
