import EventsCreator, { Events } from '../EventStore/Events'
import Dish, { DishModel } from './dish'
import Ingredient, { IngredientModel } from './ingredient'
import DishHistory, { HistoryModel } from './dishHistory'
import DishList, { DishListModel } from './dishList'
import User, { UserModel } from './user'
import { Store } from '../EventStore/EventStore'
import { ModelWriter } from './ModelWriter'

export type Models = {
  getEvents: () => Events

  dish: DishModel
  ingredient: IngredientModel
  dishHistory: HistoryModel
  dishList: DishListModel
  user: UserModel
}

export default function ({ store, modelWriter }: { store: Store, modelWriter: ModelWriter }): Models {
  const models = {} as Models
  const events = EventsCreator({ models })

  models.getEvents = () => events

  models.dish = Dish({ store, models, modelWriter })
  models.ingredient = Ingredient({ store, models, modelWriter })
  models.dishHistory = DishHistory({ store, models })
  models.dishList = DishList({ store, models, modelWriter })
  models.user = User({ store, models, modelWriter })

  return models
}
