<script lang="ts">
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import IngredientList from './IngredientList.vue'
import NewItem from './NewItem.vue'
import { REMOVE_ITEM, RESTORE_ITEM } from '../store/mutation_types'
import { CHANGE_GROUP } from '../store/action_types'
import RemoveButton from './RemoveButton.vue'

export default Vue.extend({
  data() {
    return {
      preset: {},
    }
  },

  components: { IngredientList, NewItem, RemoveButton },

  computed: {
    ...mapState(['itemGroups', 'activeItemId']),
    ...mapGetters(['shoppinglist', 'itemsInShoppingList']),
  },

  methods: {
    remove(item): void {
      this.$store.dispatch(REMOVE_ITEM, { item })
    },

    restore(item): void {
      item.amount = item.originalAmount
      delete item.originalAmount
      this.$store.dispatch(RESTORE_ITEM, { item })
    },

    changeGroup(ingredient, group: string): void {
      this.$store.dispatch(CHANGE_GROUP, { ingredient, group })
    },
  },
})
</script>

<template>
  <div class="shoppinglist">
    <h2>
      Einkaufsliste
      <span v-if="!itemsInShoppingList">ist leer</span>
    </h2>

    <IngredientList
      :items="shoppinglist"
      v-slot:default="slotProps"
      :canEditAmount="true"
    >
      <RemoveButton
        v-if="slotProps.item.amount > 0"
        @click="remove(slotProps.item)"
      />
      <button
        v-if="slotProps.item.amount <= 0"
        class="inline restore"
        title="Wieder hinzufügen"
        @click="restore(slotProps.item)"
      >
        +
      </button>
      <select
        :class="'group ' + slotProps.item.group.id"
        @change="changeGroup(slotProps.item, $event.target.value)"
      >
        <option
          v-for="(opt, key) in itemGroups"
          :key="key"
          :value="key"
          :selected="key === slotProps.item.group.id"
        >
          {{ opt.title }}
        </option>
      </select>
    </IngredientList>

    <NewItem />
  </div>
</template>

<style lang="scss">
.group {
  display: none;
  margin-left: 100px;
}

.group,
.groupTitle {
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

  @media screen {
    &.fruit {
      background-color: darkgreen;
      color: #eecc00;
    }

    &.breakfast {
      background-color: #eecc00;
      color: saddlebrown;
    }

    &.meat {
      background-color: darkred;
      color: #eecc00;
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
      color: #eecc00;
    }

    &.frozen {
      background-color: blue;
      color: white;
    }
  }
}

.active:not(.removed) .group {
  display: block;
}

.restore {
  color: green;
}
</style>
