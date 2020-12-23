<script>
import { mapState } from 'vuex'
import Dish from '@/components/Dish'
import { CHANGE_STARTDATE } from '../store/action_types'

export default {
  components: {
    Dish
  },
  
  computed: {
    ...mapState(['weekplan', 'startDate']),
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
    }
  }
}
</script>

<template>
<div class="weekplan">
  <div class="pager" @click="addToDate(-1)">▲</div>
  <ul>
    <li v-for="entry in weekplan" :key="entry.day" :class="{ past: past(entry.date) }">
      <span>{{ formatDate(entry.date) }}</span>
      <Dish v-if="entry.dish.id" :id="entry.dish.id" :name="entry.dish.name" :lastServed="entry.dish.last" :ingredients="entry.dish.items" />
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

    ul {
      margin: 0;

      li {
        min-height: 52px;
        border-bottom: 1px solid #bbbbbb;

        & > span {
          background: #eecc00;
          padding: 2px 5px;
        }

        &.past {
          background: #eeeeee;

          .servedDate, .accept, .delete {
            display: none;
          }
        }
      }
    }
  }

  @media print {
    .pager,
    ul li > span {
      display: none;
    }
  }
}
</style>