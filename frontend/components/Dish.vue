<script>
import IngredientList from '@/components/IngredientList'
import { mapState } from 'vuex'
import { DISH_DECLINED, TOGGLE_ACCEPTANCE } from '@/store/mutation_types'

export default {
  components: { IngredientList },

  props: {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    lastServed: {
      type: String,
    },
    ingredients: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      opened: false,
    }
  },

  computed: {
    ...mapState(['allIngredients', 'accepted']),

    servedDate() {
      return this.lastServed && (new Date(this.lastServed)).toLocaleString('de', { dateStyle: 'medium' })
    },

    classNames() {
      const names = ['dish']
      this.opened && names.push('opened')
      this.accepted.includes(this.id) && names.push('accepted')
      return names.join(' ')
    },

    dishIngredients() {
      return this.ingredients.map(i => ({
        ...i,
        name: this.allIngredients.find(item => item.id === i.id).name
      }))
    }
  },

  methods: {
    toggleOpen() {
      this.opened = !this.opened
    },

    decline(dishId) {
      this.$store.dispatch(DISH_DECLINED, { dishId: this.id })
    },

    toggleAcceptance(dishId) {
      this.$store.dispatch(TOGGLE_ACCEPTANCE, { dishId: this.id })
    },
  }
}
</script>

<template>
  <div :class="classNames">
    <span class="openclose" @click="toggleOpen"></span>
    <button class="inline delete" title="Ablehnen" @click="decline">×</button>
    <button class="inline accept" title="Annehmen" @click="toggleAcceptance">✓</button>
    {{name}}
    <span class="servedDate">{{servedDate}}</span>
    <div v-if="opened" class="ingredient-list">
      <IngredientList :items="dishIngredients" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dish {
  padding: 10px 0;
  border-bottom: 1px solid #bbbbbb;
  position: relative;
  line-height: 1.4em;

  button.accept {
    color: lightgray;
  }

  &.accepted button.accept {
    color: green;
  }

  .servedDate {
    background: #aaaaaa;
    position: relative;
    right: 50px;
    padding: 2px 5px;
    border-radius: 4px;
    color: white;
    font-size: 80%;
    vertical-align: text-top;
    margin-left: 1em;
    float: right;
    margin-right: -50px;
  }

  .openclose {
    display: inline-block;
    margin-right: 6px;
    border-style: solid;
    border-width: 0px 0 12px 12px;
    border-color: transparent #888888 #888888 transparent;
    transform: rotate(-45deg);
    transition: transform .3s;
    cursor: pointer;
  }

  &.opened .openclose {
    transform: rotate(45deg);
  }
}
</style>