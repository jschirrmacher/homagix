<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Dish } from '../app-types'
import Ingredient from '../components/Ingredient.vue'
import Dialog from './Dialog.vue'
import { closeDialogs } from '../lib/dialogs'
import NewItem from '../components/NewItem.vue'
import RemoveButton from '../components/RemoveButton.vue'
import { ADD_DISH_ITEM, REMOVE_DISH_ITEM, UPDATE_DISH_ITEM_AMOUNT } from '../store/action_types'
import { ReadableItem } from '../../server/Dishes/DishReader'
import { UPDATE_AMOUNT } from '../store/mutation_types'

export default Vue.extend({
  components: { Dialog, Ingredient, NewItem, RemoveButton },

  data() {
    return {
      activeItemId: null as string | null,
    }
  },

  computed: {
    ...mapState(['dishes', 'allIngredients', 'currentDishId']),

    dish(): Dish {
      const dish =
        this.currentDishId &&
        this.dishes.find(dish => dish.id === this.currentDishId)
      return dish || { name: '', items: [] }
    },

    items(): Record<string, unknown>[] {
      return this.dish.items.map(item => {
        const ingredient = this.allIngredients.find(i => i.id === item.id)
        return {
          id: item.id,
          name: ingredient && ingredient.name,
          unit: ingredient && ingredient.unit,
          amount: item.amount,
        }
      })
    },
  },

  methods: {
    setActive(item: { id: string }): void {
      this.activeItemId = item.id
    },

    setInactive(): void {
      this.activeItemId = null
    },

    addItem(item: ReadableItem) {
      this.$store.dispatch(ADD_DISH_ITEM, { dishId: this.dish.id, item })
    },

    removeItem(itemId: string): void {
      this.$store.dispatch(REMOVE_DISH_ITEM, { dishId: this.dish.id, itemId })
    },

    updateAmount(itemId: string, amount: number) {
      return this.$store.dispatch(UPDATE_DISH_ITEM_AMOUNT, { dishId: this.dish.id, itemId, amount })
    },

    close() {
      closeDialogs()
    }
  },
})
</script>

<template>
  <Dialog id="EditableIngredientList" title="Zutaten bearbeiten">
    <main>
      <h3>Rezept: {{ dish.name }}</h3>

      <ul>
        <Ingredient
          v-for="item in items"
          :key="item.id"
          :class="{ active: item.id === activeItemId }"
          :item="item"
          :canEditAmount="true"
          @click="setActive(item)"
          @blur="setInactive()"
          @update="amount => updateAmount(item.id, amount)"
        >
          <RemoveButton @click="removeItem(item.id)"/>
        </Ingredient>
      </ul>
      <NewItem @create="addItem" />
    </main>

    <footer>
      <button @click="close">Zurück</button>
    </footer>
  </Dialog>
</template>

<style lang="scss" scoped>
main {
  min-width: 400px;

  button.inline {
    margin: 0;
  }
}
</style>
