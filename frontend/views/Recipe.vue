<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { LOAD_DISHES } from '../store/action_types'

export default Vue.extend({
  props: {
    id: String,
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

    <h2>{{ dish.name }}</h2>

    <section id="ingredients">
      <h3>Zutaten</h3>
      <ul>
        <li v-for="ingredient in ingredients" :key="ingredient.id">
          {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
        </li>
      </ul>
      <p v-if="dish.source" class="source">Quelle: {{ dish.source }}</p>
    </section>

    <article>
      {{ dish.recipe || 'Es gibt bisher noch keine Beschreibung, wie das Gericht zubereitet wird.' }}
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

  .source {
    float: right;
    background: #eeeeee;
    margin-top: 0;
    padding: 5px 10px;
    border: 1px solid #aaaaaa;
  }

  article {
    margin-bottom: 1em;
    padding-top: 5px;
  }

  @media (max-width: 640px) {
    img {
      max-width: 100%;
      padding: 5px 0 0;
    }

    h2 {
      margin: 5px 0 10px;
    }

    #ingredients {
      float: none;
      margin: 0;
      padding-top: 10px;

      h3 {
        margin: 0;
      }

      ul {
        margin: 5px 0 0;
      }
    }
  }
</style>
