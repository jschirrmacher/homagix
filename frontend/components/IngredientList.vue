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
      <slot />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  padding: 10px 0 10px 22px;
  list-style: none;

  li {
    border-bottom: 1px solid #dddddd;
  }

  .amount {
    display: inline-block;
    width: 50px;
    text-align: right;
  }

  .unit {
    display: inline-block;
    width: 30px;
    text-align: center
  }
}
</style>