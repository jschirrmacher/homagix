<script>
import { mapState, mapGetters } from 'vuex'
import IngredientList from '@/components/IngredientList'

export default {
  components: { IngredientList },
  computed: mapGetters(['shoppinglist']),
}
</script>

<template>
  <div class="shoppinglist">
    <h2>Einkaufsliste</h2>

    <IngredientList :items="shoppinglist" v-slot:default="slotProps">
      <span :class="'group ' + slotProps.item.group.id">{{ slotProps.item.group.title }}</span>
    </IngredientList>
  </div>
</template>

<style lang="scss" scoped>
.group {
  float: right;
  font-size: 15px;
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
</style>