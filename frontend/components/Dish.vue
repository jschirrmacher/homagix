<script>
import IngredientList from '@/components/IngredientList'
import { mapState } from 'vuex'
import { ADD_FAVORITE, REMOVE_FAVORITE } from '../store/action_types'

export default {
  components: { IngredientList },

  props: {
    dish: {
      type: Object,
    },
  },

  data() {
    return {
      opened: false,
    }
  },

  computed: {
    ...mapState(['allIngredients', 'accepted', 'currentUser']),

    servedDate() {
      return this.dish.last
        ? new Date(this.dish.last).toLocaleString(navigator.language, {
            dateStyle: 'medium',
          })
        : 'noch nie'
    },

    classNames() {
      const names = ['dish']
      this.opened && names.push('opened')
      this.accepted.includes(this.dish.id) && names.push('accepted')
      return names.join(' ')
    },

    dishIngredients() {
      return this.dish.items.map(i => ({
        ...this.allIngredients.find(item => item.id === i.id),
        amount: i.amount,
      }))
    },

    slug() {
      return (
        '/recipes/' +
        this.dish.id +
        '/' +
        this.dish.name
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .toLowerCase()
      )
    },

    favorite() {
      return this.dish.isFavorite ? '★' : '☆'
    },
  },

  methods: {
    toggleOpen() {
      this.opened = !this.opened
    },

    toggleFavorite() {
      this.$store.dispatch(
        this.dish.isFavorite ? REMOVE_FAVORITE : ADD_FAVORITE,
        { dishId: this.dish.id }
      )
    },
  },
}
</script>

<template>
  <div :class="classNames">
    <span class="openclose" @click="toggleOpen"></span>
    <slot />
    <router-link :to="slug">
      {{ dish.name }}
    </router-link>
    <a
      v-if="currentUser && currentUser.id"
      href="#"
      class="favorite"
      @click.prevent="toggleFavorite"
      >{{ favorite }}</a
    >
    <div v-if="opened" class="ingredient-list">
      <div class="servedDate">Zuletzt am {{ servedDate }}</div>
      <IngredientList :items="dishIngredients" />
    </div>
  </div>
</template>

<style lang="scss">
.dish {
  padding: 2px 0 10px;
  position: relative;
  line-height: 1.4em;

  button.accept {
    color: lightgray;
  }

  &.accepted button.accept {
    color: green;
  }

  &:not(.served) .servedDate {
    background: #eeeeee;
    padding: 2px 22px;
    font-size: 80%;
  }

  .openclose {
    display: inline-block;
    margin-right: 6px;
    border-style: solid;
    border-width: 0px 0 12px 12px;
    border-color: transparent #888888 #888888 transparent;
    transform: rotate(-45deg);
    transition: transform 0.3s;
    cursor: pointer;
  }

  &.opened .openclose {
    transform: rotate(45deg);
  }

  a {
    text-decoration: none;
    color: black;
  }
}

@media print {
  .dish {
    display: inline-block;
    padding-bottom: 0;

    .servedDate,
    &:not(.accepted),
    .openclose {
      display: none;
    }

    .favorite {
      display: none;
    }
  }
}
</style>
