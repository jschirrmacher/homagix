import { Transform, TransformOptions, TransformCallback } from 'stream'

export default class testMigration extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(event: { name: string }, encoding: BufferEncoding, callback: TransformCallback) {
    event.name = 'Migrated event'
    this.push(event)
    callback()
  }
}
