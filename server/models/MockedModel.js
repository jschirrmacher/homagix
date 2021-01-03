import Models from './index.js'

const modelWriter = {
  writeDish() {},
  writeIngredient() {},
  writeUser() {},
  writeDishlist() {},
}

export default ({ store }) => Models({ store, modelWriter })
