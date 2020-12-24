<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { LOAD_DISHES } from '../store/action_types'

export default Vue.extend({
  props: {
    id: String,
  },

  mounted() {
    this.$store.dispatch(LOAD_DISHES)
  },

  computed: {
    ...mapState(['dishes', 'allIngredients']),

    dish() {
      return (this.dishes && this.dishes.find(dish => dish.id === this.id)) || {}
    },

    ingredients() {
      if (!this.dish || !this.dish.items || !this.allIngredients) {
        return []
      }
      return this.dish.items.map(item => {
        const ingredient = this.allIngredients.find(i => i.id === item.id)
        if (!ingredient) {
          return {}
        }
        return { ...ingredient, amount: item.amount }
      })
    }
  }
})
</script>

<template>
  <div>
    <img v-if="dish.image" :src="'/images/' + dish.image">

    <section id="ingredients">
      <h3>Zutaten</h3>
      <ul>
        <li v-for="ingredient in ingredients" :key="ingredient.id">
          {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
        </li>
      </ul>
    </section>

    <h2>{{ dish.name }}</h2>

    <article>
      {{ dish.recipe }}
    </article>

    <button @click="$router.go(-1)">Zurück</button>
  </div>
</template>

<style lang="scss" scoped>
  img {
    width: 640px;
    max-width: 66%;
    padding: 1em 0;
  }

  #ingredients {
    float: right;
    border: 1px solid #dddddd;
    padding: 20px 10px 10px;
    margin: 1em 0 10px 10px;

    h3 {
      margin-top: 0;
    }
  }

  article {
    margin-bottom: 1em;
  }
</style>
