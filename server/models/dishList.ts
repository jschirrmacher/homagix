import { Models } from "."
import { Store } from "../EventStore/EventStore"
import { ModelWriter } from "./ModelWriter"

type DishId = string
type ListId = string
type Params = {
  dishId: DishId
  listId: ListId
}
type WriterFunction = (listId: ListId, dishList: DishList) => void

export type DishList = DishId[]

export type DishListModel = {
  reset(): void
  getById(listId: string): DishList
}

const lists = {} as Record<ListId, DishList>

function addDish(writer: WriterFunction, { dishId, listId }: Params) {
  lists[listId] = lists[listId] || []
  lists[listId].includes(dishId) || lists[listId].push(dishId)
  writer(listId, lists[listId])
}

function removeDish(writer: WriterFunction, { dishId, listId }: Params) {
  lists[listId] = lists[listId].filter(id => id !== dishId)
  writer(listId, lists[listId])
}

export default function ({ store, models, modelWriter }: { store: Store, models: Models, modelWriter: ModelWriter}): DishListModel {
  const { addDishToList, removeDishFromList } = models.getEvents()
  store
    .on(addDishToList, (params: Params) => addDish(modelWriter.writeDishlist, params))
    .on(removeDishFromList, (params: Params) => removeDish(modelWriter.writeDishlist, params))

  return {
    reset: () => Object.assign(lists, {}),
    getById: listId => lists[listId],
  }
}
