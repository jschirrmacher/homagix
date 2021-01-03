import Models from './index.js'

const modelWriter = {
  writeDish() {},
  writeIngredient() {},
  writeUser() {},
}

export default ({ store }) => Models({ store, modelWriter })
