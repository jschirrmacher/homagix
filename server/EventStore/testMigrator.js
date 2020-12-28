import { Transform } from 'stream'

export default class testMigration extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)
  }

  _transform(event, encoding, callback) {
    event.name = 'Migrated event'
    this.push(event)
    callback()
  }
}
