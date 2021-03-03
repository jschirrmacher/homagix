<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import { Ingredient } from '../../server/models/ingredient'
import { UPDATE_AMOUNT } from '../store/mutation_types'

export default Vue.extend({
  props: {
    item: {
      type: Object,
      default: () => ({}) as PropType<Ingredient>,
    },
    canEditAmount: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState(['units']),

    itemClass(): string {
      return this.item.amount <= 0 ? 'removed' : ''
    },
  },

  methods: {
    getStep(unit: string): number {
      const entry = this.units.find(u => u.name === unit)
      return entry ? entry.step : 1
    },
  },
})
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
      @change="event => $emit('update', +event.target.value)"
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
    background: transparent;
  }
}

.unit {
  display: inline-block;
  width: 65px;
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
