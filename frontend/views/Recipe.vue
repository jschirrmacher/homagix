<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { MODIFY_DISH, LOAD_DISHES } from '../store/action_types'
import EditableField from '@/components/EditableField.vue'

function mapDishField(field, defaultValue = '') {
  return {
    [field]: {
      get() {
        const getDish = () => (this.dishes && this.dishes.find(dish => dish.id === this.id)) || {}
        return this.changes[field] || getDish()[field] || defaultValue
      },
      set(value) {
        this.changes[field] = value.trim()
        this.triggerSave()
      }
    }
  }
}

export default Vue.extend({
  components: {
    EditableField,
  },

  props: {
    id: String,
  },
  
  data() {
    return {
      changes: {},
      timer: undefined,
    }
  },

  computed: {
    ...mapState(['dishes', 'allIngredients', 'currentUser']),
    ...mapDishField('name'),
    ...mapDishField('recipe'),

    dish() {
      return (this.dishes && this.dishes.find(dish => dish.id === this.id)) || {}
    },

    editable() {
      if (this.currentUser.id) {
        if (this.currentUser.isAdmin) {
          return true
        }
        if ([this.currentUser.listId, this.currentUser.id].includes(this.dish.ownedBy)) {
          return true
        }
      }
      return false
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
    },
  },

  methods: {
    async save() {
      const dish = {
        ...this.dish,
        ...this.changes,
        ownedBy: this.currentUser.listId || this.currentUser.id
      }
      await this.$store.dispatch(MODIFY_DISH, { dish })
      this.changes = {}
    },

    triggerSave() {
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(async () => {
        this.timer = undefined
        this.save()
      }, 3000)
    },

    async goBack() {
      await this.save()
      this.$router.go(-1)
    }
  }
})
</script>

<template>
  <div>
    <img v-if="dish.image" :src="'/images/' + dish.image" />

    <EditableField tag="h2" v-model="name" :editable="editable" placeholder="Name" />

    <section id="ingredients">
      <h3>Zutaten</h3>
      <ul>
        <li v-for="ingredient in ingredients" :key="ingredient.id">
          {{ ingredient.amount }} {{ ingredient.unit }} {{ ingredient.name }}
        </li>
      </ul>
      <p v-if="dish.source" class="source">Quelle: {{ dish.source }}</p>
    </section>

    <EditableField tag="article" v-model="recipe" :editable="editable"
      placeholder="Es gibt bisher noch keine Beschreibung, wie das Gericht zubereitet wird."
    />

    <button @click="goBack">Zurück</button>
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
