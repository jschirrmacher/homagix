<script>
import { mapState } from 'vuex'
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <span class="amount">{{ item.amount }}</span>
      <span class="unit">{{ item.unit }}</span>
      {{ item.name }}
      <slot v-bind:item="item" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  li {
    border-bottom: 1px solid #dddddd;
    padding: 4px 0;

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
    width: 35px;
    text-align: left;
  }

  @media print {
    column-count: 2;
  }
}
</style>