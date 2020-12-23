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
    ...mapState(['weekplan', 'startDate']),
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
    <li v-for="entry in weekplan" :key="entry.day" :class="{ past: past(entry.date) }">
      <span class="day">{{ formatDate(entry.date) }}</span>
      <Dish v-if="entry.dish.id" :id="entry.dish.id" :name="entry.dish.name" :lastServed="entry.dish.last" :ingredients="entry.dish.items">
        <button class="inline delete" title="Ablehnen" @click="() => decline(entry.dish.id)">×</button>
        <button class="inline accept" title="Annehmen" @click="() => toggleAcceptance(entry.dish.id)">✓</button>
      </Dish>
    </li>
  </ul>
  <div class="pager" @click="addToDate(1)">▼</div>
</div>
</template>

<style lang="scss">
.weekplan {
  @media (min-width: 640px) {
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

    > ul {
      margin: 0;

      > li {
        min-height: 52px;
        border-bottom: 1px solid #bbbbbb;

        &:first-of-type {
          border-top: 1px solid #bbbbbb;
        }

        .day {
          background: #eecc00;
          padding: 2px 5px;
          font-size: 13px;
        }

        &.past {
          background: #f7f7f7;

          .servedDate, .accept, .delete {
            display: none;
          }
        }
      }
    }
  }

  @media print {
    .pager {
      display: none;
    }

    day {
      display: inline-block;
    }
  }
}
</style>