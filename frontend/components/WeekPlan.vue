<script>
import { mapState } from 'vuex'
import Dish from '@/components/Dish'
import { STARTDATE_CHANGED } from '../store/mutation_types'

export default {
  components: {
    Dish
  },
  
  computed: {
    ...mapState(['proposals']),
    startDate: {
      get() {
        return this.$store.state.startDate.toISOString().replace(/T.*$/, '')
      },
      set(startDate) {
        this.$store.commit(STARTDATE_CHANGED, { startDate })
      }
    }
  },
}
</script>

<template>
<div>
  <ul>
    <li v-for="proposal in proposals" :key="proposal.id">
      <Dish :id="proposal.id" :name="proposal.name" :lastServed="proposal.last" :ingredients="proposal.items" />
    </li>
  </ul>
</div>
</template>

<style scoped lang="scss">
@media (min-width: 640px) {
  ul {
    margin: 1em 0;
  }
}
</style>