<script>
import { mapState, mapGetters } from 'vuex'
import IngredientList from './IngredientList'
import NewItem from './NewItem'
import { REMOVE_ITEM, RESTORE_ITEM } from '../store/mutation_types'

export default {
  data() {
    return {
      preset: {}
    }
  },

  components: { IngredientList, NewItem },

  computed: mapGetters(['shoppinglist', 'itemsInShoppingList']),

  methods: {
    remove(item) {
      this.$store.dispatch(REMOVE_ITEM, { item })
    },

    restore(item) {
      item.amount = item.originalAmount
      delete item.originalAmount
      this.$store.dispatch(RESTORE_ITEM, { item })
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

    <IngredientList v-if="itemsInShoppingList" :items="shoppinglist" v-slot:default="slotProps" :canEditAmount="true">
      <button v-if="slotProps.item.amount > 0" class="inline delete" title="Von der Liste streichen" @click="remove(slotProps.item)">×</button>
      <button v-if="slotProps.item.amount <= 0" class="inline restore" title="Wieder hinzufügen" @click="restore(slotProps.item)">+</button>
      <span :class="'group ' + slotProps.item.group.id">{{ slotProps.item.group.title }}</span>
    </IngredientList>

    <NewItem />
  </div>
</template>

<style lang="scss" scoped>
.group {
  float: right;
  font-size: 14px;
  line-height: 1.4em;
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