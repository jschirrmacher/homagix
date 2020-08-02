<script>
import { mapState, mapGetters } from 'vuex'
import WeekPlan from '@/components/WeekPlan'
import ShoppingList from '@/components/ShoppingList'

export default {
  components: { WeekPlan, ShoppingList },
  computed: {
    ...mapState(['proposals']),
    ...mapGetters(['shoppinglist', 'itemsOnShoppingList']),
  },
  methods: {
    print() {
      window.print()
    },

    completed() {

    }
  }
}
</script>

<template>
  <div class="Home">
    <WeekPlan />
    <ShoppingList />

    <button v-if="itemsOnShoppingList" @click="print">Drucken</button>
    <button v-if="itemsOnShoppingList" @click="completed">Erledigt</button>
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
