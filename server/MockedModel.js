import Models from './models/index.js'
import { store } from './Store.mock.js'

const modelWriter = {
  writeDish() {},
  writeIngredient() {},
}
const models = Models({ store, modelWriter })

export default models
