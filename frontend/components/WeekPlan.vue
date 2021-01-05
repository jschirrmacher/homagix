<script>
import { mapState } from 'vuex'
import Dish from '@/components/Dish'
import { CHANGE_STARTDATE } from '../store/action_types'
import { DISH_DECLINED, TOGGLE_ACCEPTANCE } from '../store/mutation_types'

export default {
  components: {
    Dish
  },
  
  computed: {
    ...mapState(['weekplan', 'startDate', 'dishes']),

    startDate: {
      get() {
        return this.$store.state.startDate.toISOString().replace(/T.*$/, '')
      },
      set(startDate) {
        if (startDate) {
          this.$store.dispatch(CHANGE_STARTDATE, { startDate })
        }
      }
    }
  },

  methods: {
    formatDate(date) {
      return (new Date(date)).toLocaleDateString(navigator.language, { weekday: 'short', day: 'numeric', month: 'numeric' })
    },

    addToDate(offset) {
      const startDate = new Date(this.startDate)
      startDate.setDate(startDate.getDate() + offset)
      this.$store.dispatch(CHANGE_STARTDATE, { startDate })
    },

    past(date) {
      return date < (new Date()).toISOString().split('T')[0]
    },

    decline(dishId) {
      this.$store.dispatch(DISH_DECLINED, { dishId })
    },

    toggleAcceptance(dishId) {
      this.$store.dispatch(TOGGLE_ACCEPTANCE, { dishId })
    },

    dish(dishId) {
      return this.dishes.find(dish => dish.id === dishId)
    }
  }
}
</script>

<template>
<div class="weekplan">
  <h2>
    Wochenplan beginnend ab
    <input type="date" v-model="startDate" autocomplete="off">
  </h2>
  <div class="pager" @click="addToDate(-1)">▲</div>
  <ul>
    <li v-for="entry in weekplan" :key="entry.date" :class="{ past: past(entry.date) }">
      <span class="day">{{ formatDate(entry.date) }}</span>
      <Dish v-if="entry.dishId" :dish="dish(entry.dishId)">
        <button class="inline delete" title="Ablehnen" @click="() => decline(entry.dishId)">×</button>
        <button class="inline accept" title="Annehmen" @click="() => toggleAcceptance(entry.dishId)">✓</button>
      </Dish>
    </li>
  </ul>
  <div class="pager" @click="addToDate(1)">▼</div>
</div>
</template>

<style lang="scss">
.weekplan {
  .pager {
    text-align: center;
    background: #eeeeee;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: #dddddd;
    }

    &:active {
      background: #cccccc;
    }
  }

  > ul > li {
    > .day {
      background: #eecc00;
      padding: 2px 5px;
      font-size: 13px;
      display: block;
      margin-bottom: 1px;
    }

    &.past {
      .servedDate, .accept, .delete {
        display: none;
      }
    }
  }

  @media (min-width: 640px) {
    > ul {
      margin: 0;

      > li {
        min-height: 52px;
        border-bottom: 1px solid #bbbbbb;

        &:first-of-type {
          border-top: 1px solid #bbbbbb;
        }

        &.past {
          background: #f7f7f7;
        }

        .day {
          display: inline;
        }
      }
    }
  }

  @media print {
    .pager {
      display: none;
    }

    .day {
      display: inline-block;
    }
  }
}
</style>