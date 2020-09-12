
<script>
import { mapState } from 'vuex'

export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },

  computed: {
    itemClass() {
      return this.item.amount <= 0 ? 'removed' : ''
    }
  }
}
</script>

<template>
  <li :class="itemClass">
    <span class="amount">{{ item.amount }}</span>
    <span class="unit">{{ item.unit }}</span>
    {{ item.name }}
    <slot v-bind:item="item" />
  </li>
</template>

<style lang="scss" scoped>
li {
  border-bottom: 1px solid #dddddd;
  padding: 4px 0;
  line-height: 1.6em;

  &:last-of-type {
    border-bottom: none;
  }
}

.amount {
  display: inline-block;
  width: 50px;
  text-align: right;
}

.unit {
  display: inline-block;
  width: 45px;
  text-align: left;
}

.removed {
  color: #888888;
  text-decoration: line-through;

  .amount, .unit {
    visibility: hidden;
  }

  @media print {
    display: none;
  }
}
</style>