<script>
import { mapState } from 'vuex'
import { UPDATE_AMOUNT } from '../store/mutation_types'

export default {
  props: {
    item: {
      type: Object,
      default: () => {},
    },
    canEditAmount: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    itemClass() {
      return this.item.amount <= 0 ? 'removed' : ''
    },
  },

  methods: {
    getStep(unit) {
      return unit === 'g' || unit === 'ml' ? 100 : 1
    },

    amountChanged(item, newAmount) {
      this.$store.dispatch(UPDATE_AMOUNT, { item, newAmount })
    },
  },
}
</script>

<template>
  <li :class="itemClass" @click.stop="$emit('click')">
    <input
      type="number"
      class="amount"
      min="0"
      :step="getStep(item.unit)"
      :value="item.amount"
      :disabled="!canEditAmount"
      @change="event => amountChanged(item, +event.target.value)"
      @blur="$emit('blur')"
    />
    <span class="unit">{{ item.unit }}</span>
    {{ item.name }}
    <slot v-bind:item="item" />
  </li>
</template>

<style lang="scss" scoped>
li {
  border-bottom: 1px solid #dddddd;
  padding: 0;

  &:last-of-type {
    border-bottom: none;
  }
}

.amount {
  display: inline-block;
  width: 50px;
  text-align: right;

  &[disabled] {
    border-color: transparent;
    background: white;
  }
}

.unit {
  display: inline-block;
  width: 45px;
  text-align: left;
}

.removed {
  color: #888888;
  text-decoration: line-through;

  .amount,
  .unit {
    visibility: hidden;
  }

  @media print {
    display: none;
  }
}
</style>
