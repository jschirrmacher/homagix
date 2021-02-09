<script lang="ts">
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import Dish from './Dish.vue'
import { DISH_DECLINED, CHANGE_STARTDATE } from '../store/action_types'
import { TOGGLE_ACCEPTANCE } from '../store/mutation_types'

type DishData = {}

export default Vue.extend({
  components: {
    Dish,
  },

  computed: {
    ...mapState(['weekplan', 'startDate', 'dishes']),
    ...mapGetters(['maxServedDate']),

    startDate: {
      get(): string {
        return this.$store.state.startDate.toISOString().replace(/T.*$/, '')
      },
      set(startDate: string): void {
        if (startDate) {
          this.$store.dispatch(CHANGE_STARTDATE, { startDate })
        }
      },
    },
  },

  methods: {
    formatDate(date: string): string {
      return new Date(date).toLocaleDateString(navigator.language, {
        weekday: 'short',
        day: 'numeric',
        month: 'numeric',
      })
    },

    addToDate(offset: number): void {
      const startDate = new Date(this.startDate)
      startDate.setDate(startDate.getDate() + offset)
      this.$store.dispatch(CHANGE_STARTDATE, { startDate })
    },

    past(date: string): boolean {
      return date < new Date().toISOString().split('T')[0]
    },

    decline(dishId: string): void {
      this.$store.dispatch(DISH_DECLINED, { dishId })
    },

    toggleAcceptance(dishId: string): void {
      this.$store.dispatch(TOGGLE_ACCEPTANCE, { dishId })
    },

    dish(dishId: string): DishData {
      return this.dishes.find((dish: { id: string }) => dish.id === dishId)
    },
  },
})
</script>

<template>
  <div class="weekplan">
    <h2>
      Wochenplan beginnend ab
      <input type="date" v-model="startDate" autocomplete="off" />
    </h2>
    <div class="pager" @click="addToDate(-1)">▲</div>
    <ul>
      <li
        v-for="entry in weekplan"
        :key="entry.date"
        :class="{
          past: past(entry.date),
          planned: entry.date <= maxServedDate,
        }"
      >
        <span class="day">{{ formatDate(entry.date) }}</span>
        <Dish v-if="entry.dishId" :dish="dish(entry.dishId)">
          <button
            class="inline delete"
            title="Ablehnen"
            @click="() => decline(entry.dishId)"
          >
            ×
          </button>
          <button
            class="inline accept"
            title="Annehmen"
            @click="() => toggleAcceptance(entry.dishId)"
          >
            ✓
          </button>
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

    &.planned {
      .servedDate,
      .accept,
      .delete {
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

        &.planned {
          background: #f7f7f7;
        }

        .day {
          display: inline;
        }
      }
    }
  }

  @media print {
    & > ul > li {
      min-height: 0;
      padding-bottom: 2px;

      .day {
        display: inline;
        background: transparent;
      }
    }

    .pager {
      display: none;
    }
  }
}
</style>
