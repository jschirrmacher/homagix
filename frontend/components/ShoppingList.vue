<script>
import { mapState, mapGetters } from 'vuex'
import IngredientList from '@/components/IngredientList'
import { ITEM_REMOVED, ITEM_ADDED } from '../store/mutation_types'

export default {
  components: { IngredientList },
  computed: mapGetters(['shoppinglist', 'itemsInShoppingList']),

  methods: {
    remove(ingredientId) {
      this.$store.dispatch(ITEM_REMOVED, { ingredientId })
    },

    restore(item) {
      item.amount = -item.amount
      this.$store.dispatch(ITEM_ADDED, { item })
    }
  }
}
</script>

<template>
  <div class="shoppinglist">
    <h2>
      Einkaufsliste
      <span v-if="!itemsInShoppingList">ist leer</span>
    </h2>

    <IngredientList v-if="itemsInShoppingList" :items="shoppinglist" v-slot:default="slotProps">
      <button v-if="slotProps.item.amount > 0" class="inline delete" title="Von der Liste streichen" @click="remove(slotProps.item.id)">×</button>
      <button v-if="slotProps.item.amount <= 0" class="inline restore" title="Wieder hinzufügen" @click="restore(slotProps.item)">✓</button>
      <span :class="'group ' + slotProps.item.group.id">{{ slotProps.item.group.title }}</span>
    </IngredientList>
  </div>
</template>

<style lang="scss" scoped>
.group {
  float: right;
  font-size: 15px;
  border: none;
  background: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  padding: 2px 10px;
  border-radius: 3px;
  -ms-text-align-last: center;
  text-align-last: center;

  &.fruit {
    background-color: darkgreen;
    color: yellow;
  }

  &.breakfast {
    background-color: yellow;
    color: saddlebrown;
  }

  &.meat {
    background-color: darkred;
    color: yellow;
  }

  &.cooled {
    background-color: cornflowerblue;
    color: white;
  }

  &.tinned {
    background-color: lightgrey;
    color: black;
  }

  &.drinks {
    background-color: yellowgreen;
    color: yellow;
  }

  &.frozen {
    background-color: blue;
    color: white;
  }
}

.restore {
  color: green;
}
</style>