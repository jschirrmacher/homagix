<script>
import { mapState } from 'vuex'
import Ingredient from './Ingredient'

export default {
  components: { Ingredient },

  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <ul>
    <Ingredient v-for="item in items" :key="item.id" :item="item">
      <slot v-bind:item="item" />
    </Ingredient>
  </ul>
</template>

<style lang="scss" scoped>
@media print {
  ul {
    column-count: 2;
  }
}
</style>