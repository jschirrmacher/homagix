<script>
import Vue from 'vue'

export default Vue.extend({
  
})
</script>

<template>
  <nav>
    <router-link to="/">Wochenplan</router-link>
    <router-link to="/recipes">Rezepte</router-link>
  </nav>
</template>

<style scoped lang="scss">
  nav {
    display: block;
    padding-top: 10px;
  }

  a {
    color: white;
    text-decoration: none;
    margin-right: 10px;

    &:hover {
      color: #dddddd;
    }
  }
</style>
