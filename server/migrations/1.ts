import { Transform, TransformOptions, TransformCallback } from 'stream'

type DishEvent = {
  name?: string
  id?: string
  value?: string
  type: string
  dish: string
  date: string
}

export default class mig1 extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(
    event: DishEvent,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    if (event.type === 'dish-updated' || event.type === 'dishes-updated') {
      if (event.name !== 'last') {
        throw Error(
          `Update of dish's attribute '${event.name}' is not expected`
        )
      }
      event.type = 'served'
      event.dish = event.id as string
      event.date = (event.value as string).replace(/T.*$/, '')
      delete event.id
      delete event.name
      delete event.value
    }
    this.push(event)
    callback()
  }
}
