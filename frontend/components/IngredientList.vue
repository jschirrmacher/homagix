<script>
import { mapState } from 'vuex'
import Ingredient from './Ingredient'
import { SET_ACTIVE_ITEM } from '../store/mutation_types'

export default {
  components: { Ingredient },

  props: {
    items: {
      type: Array,
      default: () => []
    },
    canEditAmount: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    setActive(item) {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: item.id })
    },

    setInactive() {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: null })
    },

    canEdit(item) {
      return this.canEditAmount && item.id === this.$store.state.activeItemId
    }
  }
}
</script>

<template>
  <ul>
    <Ingredient v-for="item in items" :key="item.id"
      :item="item"
      :canEditAmount="canEdit(item)"
      @click="setActive(item)"
      @blur="setInactive()"
    >
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