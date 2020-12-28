import Models from './index.js'
import { store } from '../EventStore/Store.mock.js'

const modelWriter = {
  writeDish() {},
  writeIngredient() {},
}
const models = Models({ store, modelWriter })

export default models
