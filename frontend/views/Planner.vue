<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import WeekPlan from '../components/WeekPlan.vue'
import ShoppingList from '../components/ShoppingList.vue'
import { SHOPPING_DONE } from '../store/mutation_types'
import { CHANGE_STARTDATE } from '../store/action_types'

export default Vue.extend({
  components: { WeekPlan, ShoppingList },

  computed: {
    ...mapGetters(['shoppinglist', 'itemsInShoppingList']),
  },

  mounted(): void {
    this.$store.dispatch(CHANGE_STARTDATE, { startDate: new Date() })
  },

  methods: {
    print(): void {
      window.print()
    },

    completed(): void {
      this.$store.dispatch(SHOPPING_DONE)
    },
  },
})
</script>

<template>
  <div class="Planner">
    <WeekPlan />
    <ShoppingList />

    <button v-if="itemsInShoppingList" @click="print">Drucken</button>
    <button v-if="itemsInShoppingList" @click="completed">Erledigt</button>
  </div>
</template>
