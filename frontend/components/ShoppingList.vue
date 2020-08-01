<script>
import { mapState } from 'vuex'
import IngredientList from './IngredientList'

export default {
  components: { IngredientList },
  computed: mapState(['shoppinglist'])
}
</script>

<template>
  <div class="shoppinglist">
    <h2>Einkaufsliste</h2>

    <IngredientList :items="shoppinglist" />
  </div>
</template>

<style lang="scss" scoped>
.shoppinglist {
  padding: 10px;
}
</style>