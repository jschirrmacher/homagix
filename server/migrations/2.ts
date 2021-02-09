import { Transform, TransformOptions, TransformCallback } from 'stream'

type Event = {
  type: string
  dish?: string
  dishId: string
  id?: string
  ingredient?: string
  ingredientId: string
}

export default class mig2 extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(
    event: Event,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    event.type = event.type.replace(/-(.)/g, (m, p) => p.toUpperCase())

    if (
      (event.type === 'served' || event.type === 'ingredientAssigned') &&
      event.dish
    ) {
      event.dishId = event.dish
      delete event.dish
    }

    if (event.type === 'ingredientAssigned' && event.ingredient) {
      event.ingredientId = event.ingredient
      delete event.ingredient
    }

    if (event.type === 'ingredientUpdated' && event.id) {
      event.ingredientId = event.id
      delete event.id
    }

    this.push(event)
    callback()
  }
}
