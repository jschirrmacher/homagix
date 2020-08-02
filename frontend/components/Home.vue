<script>
import { mapState, mapGetters } from 'vuex'
import WeekPlan from '@/components/WeekPlan'
import ShoppingList from '@/components/ShoppingList'
import { SHOPPING_DONE } from '../store/mutation_types'

export default {
  components: { WeekPlan, ShoppingList },
  computed: {
    ...mapState(['proposals']),
    ...mapGetters(['shoppinglist', 'itemsInShoppingList']),
  },
  methods: {
    print() {
      window.print()
    },

    completed() {
      this.$store.dispatch(SHOPPING_DONE)
    }
  }
}
</script>

<template>
  <div class="Home">
    <WeekPlan />
    <ShoppingList />

    <button v-if="itemsInShoppingList" @click="print">Drucken</button>
    <button v-if="itemsInShoppingList" @click="completed">Erledigt</button>
  </div>
</template>

<style lang="scss">
.Home {
  padding: 10px 1em;
}

@media print {
  @page {
    size: A4 portrait;
  }

  h1 {
    padding: 10px;
  }

  button,
  .group {
    display: none;
  }
}
</style>
