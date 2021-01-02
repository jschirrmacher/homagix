import Events from '../EventStore/Events.js'
import Dish from './dish.js'
import Ingredient from './ingredient.js'
import DishHistory from './dishHistory.js'
import DishList from './dishlist.js'
import User from './user.js'

export default function ({ store, modelWriter }) {
  const models = {}
  const events = Events({ models })

  models.getEvents = () => events
  
  models.dish = Dish({ store, events, modelWriter })
  models.ingredient = Ingredient({ store, events, modelWriter })
  models.dishHistory = DishHistory({ store, events, modelWriter })
  models.dishList = DishList({ store, events, modelWriter })
  models.user = User({ store, events, modelWriter })

  return models
}
