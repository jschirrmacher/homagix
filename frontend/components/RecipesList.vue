<script>
import Vue from 'vue'
import Dish from '@/components/Dish'
import { LOAD_DISHES } from '../store/action_types'
import { mapState } from 'vuex'

export default Vue.extend({
  components: {
    Dish,
  },

  computed: {
    ...mapState(['dishes']),

    sortedDishes() {
      return [...this.dishes.filter(d => !d.alwaysOnList)].sort((d1, d2) => d1.name.localeCompare(d2.name))
    }
  },

  mounted() {
    this.$store.dispatch(LOAD_DISHES)
  },
})
</script>

<template>
<div>
  <h2>Rezepte</h2>
  <ul id="recipes">
    <li v-for="dish in sortedDishes" :key="dish.id">
      <Dish :dish="dish" />
    </li>
  </ul>
</div>
</template>
