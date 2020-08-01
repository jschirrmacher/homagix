<script>
export default {
}
</script>

<template>
  <ul>
    <router-link :to="{name: 'weekplan'}" tag="li">Planen</router-link>
    <router-link :to="{name: 'shoppinglist'}" tag="li">Einkaufen</router-link>
  </ul>
</template>

<style lang="scss" scoped>
ul {
  list-style: none;
  margin: 10px;
  padding: 0;
  border-bottom: 1px solid #aaaaaa;

  li {
    display: inline-block;
    border: 1px solid transparent;
    border-bottom: none;
    border-radius: 5px 5px 0 0;
    bottom: -1px;
    position: relative;
    list-style: none;
    padding: 6px 12px;
    cursor: pointer;

    &:hover {
      background: #eeeeee;
    }

    &.router-link-active {
      background: #fff;
      border-color: #aaa;
      color: black;
    }
  }
}
</style>