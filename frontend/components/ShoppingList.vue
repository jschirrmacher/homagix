<script>
import { mapState, mapGetters } from 'vuex'
import IngredientList from './IngredientList'

export default {
  components: { IngredientList },
  computed: {
    ...mapState(['allIngredients']),
    ...mapGetters(['shoppinglist']),
  },

  methods: {
    print() {}
  }
}
</script>

<template>
  <div class="shoppinglist">
    <h2>Einkaufsliste</h2>

    <IngredientList :items="shoppinglist">
      <template v-slot:default="slotProps">
        <span :class="'group ' + slotProps.item.group.id">{{ slotProps.item.group.title }}</span>
      </template>
    </IngredientList>

    <button v-if="!!shoppinglist.length" @click="print">Drucken</button>
    <router-link v-if="!!shoppinglist.length" :to="{name: 'completed'}" tag="button">Erledigt</router-link>
  </div>
</template>

<style lang="scss" scoped>
.shoppinglist {
  padding: 10px;
}

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
  margin-right: -25px;

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