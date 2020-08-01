<script>
import TabBar from '@/components/TabBar'
import { mapState } from 'vuex'
import { CLEAR_ERROR, GET_PROPOSALS } from './store/mutation_types'

export default {
  components: { TabBar },

  computed: mapState(['error']),

  mounted() {
    this.$store.dispatch(GET_PROPOSALS)
  },

  methods: {
    clearError() {
      this.$store.commit(CLEAR_ERROR)
    }
  }
}
</script>

<template>
  <div>
    <h1>Homagix</h1>

    <div v-if="error.message" class="error">
      <span @click="clearError">×</span>
      {{ error.message }}
    </div>

    <TabBar />
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="scss">
html, body {
  font-family: Arial, Helvetica, sans-serif;
  padding: 0;
  margin: 0;
}

h1 {
  color: #FFFF00;
  font-size: 31px;
  margin: 0;
  padding: 10px 10px 5px;
  background: linear-gradient(to bottom right, #F0A30A, rgb(240, 205, 10));
  overflow: hidden;

  &:after {
    content: '';
    display: block;
    position: absolute;
    left: 11px;
    top: 10px;
    width: 16px;
    height: 16px;
    border: 4px none #FFFF00;
    border-top-style: solid;
    border-left-style: solid;
    transform: rotate(45deg);
  }
}

.content {
  padding: 15px;
}

.error {
  color: red;
}
</style>