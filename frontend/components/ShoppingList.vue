<script>
import { mapState, mapGetters } from 'vuex'
import IngredientList from './IngredientList'

export default {
  components: { IngredientList },
  computed: {
    ...mapState(['allIngredients']),
    ...mapGetters(['shoppinglist']),
    items() {
      return this.shoppinglist.map(i => ({
        ...i,
        name: this.allIngredients.find(item => item.id === i.id).name
      }))
    }
  },
}
</script>

<template>
  <div class="shoppinglist">
    <h2>Einkaufsliste</h2>

    <IngredientList :items="items" />
  </div>
</template>

<style lang="scss" scoped>
.shoppinglist {
  padding: 10px;
}
</style>