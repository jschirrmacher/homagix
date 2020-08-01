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
      {{ item.amount }} {{ item.unit }} {{ item.name }}
      <slot />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.shoppinglist {
  padding: 10px;
}
</style>