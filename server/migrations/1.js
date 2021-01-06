import { Transform } from 'stream'

export default class mig1 extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)
  }

  _transform(event, encoding, callback) {
    if (event.type === 'dish-updated' || event.type === 'dishes-updated') {
      if (event.name !== 'last') {
        throw Error(
          `Update of dish's attribute '${event.name}' is not expected`
        )
      }
      event.type = 'served'
      event.dish = event.id
      event.date = event.value.replace(/T.*$/, '')
      delete event.id
      delete event.name
      delete event.value
    }
    this.push(event)
    callback()
  }
}
