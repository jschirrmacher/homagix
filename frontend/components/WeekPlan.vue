<script>
import { mapState } from 'vuex'
import Dish from './Dish'

export default {
  components: {
    Dish
  },

  data() {
    return {
      startDate: new Date().toISOString().replace(/T.*$/, '')
    }
  },

  computed: {
    ...mapState(['proposals']),
  },
}
</script>

<template>
<div class="plan">
  <h2>Wochenplan</h2>
  <p>beginnend ab <input type="date" v-model="startDate" autocomplete="off"></p>

  <ul>
    <li v-for="proposal in proposals" :key="proposal.id">
      <Dish :id="proposal.id" :name="proposal.name" :lastServed="proposal.last" :ingredients="proposal.ingredients" />
    </li>
  </ul>

  <router-link :to="{name: 'shoppinglist'}" tag="button">Zur Einkaufsliste</router-link>
</div>
</template>

<style scoped lang="scss">
.plan {
  padding: 10px;
}

ul {
  list-style: none;
  padding: 0;

  @media (min-width: 640px) {
    margin: 1em 0;
  }
}
</style>