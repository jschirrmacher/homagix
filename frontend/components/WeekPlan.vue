<script>
import { mapState } from 'vuex'
import Dish from '@/components/Dish'

export default {
  components: {
    Dish
  },

  data() {
    return {
      startDate: new Date().toISOString().replace(/T.*$/, '')
    }
  },
  
  computed: mapState(['proposals']),
}
</script>

<template>
<div>
  <h2>Wochenplan beginnend ab <input type="date" v-model="startDate" autocomplete="off"></h2>

  <ul>
    <li v-for="proposal in proposals" :key="proposal.id">
      <Dish :id="proposal.id" :name="proposal.name" :lastServed="proposal.last" :ingredients="proposal.ingredients" />
    </li>
  </ul>
</div>
</template>

<style scoped lang="scss">
h2 input {
  font-size: 1em;
  font-family: Arial, helvetica, sans-serif;
}

@media (min-width: 640px) {
  ul {
    margin: 1em 0;
  }
}

@media print {
  input {
    border: none;
  }
}
</style>