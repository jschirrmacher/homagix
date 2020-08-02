<script>
import TabBar from '@/components/TabBar'
import { mapState } from 'vuex'
import { CLEAR_ERROR, GET_PROPOSALS, GET_INGREDIENTS } from './store/mutation_types'

export default {
  components: { TabBar },

  computed: mapState(['error']),

  mounted() {
    this.$store.dispatch(GET_PROPOSALS)
    this.$store.dispatch(GET_INGREDIENTS)
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

    <div class="content">
      <TabBar />
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

h2 {
  margin-top: 0;
}

.content {
  max-width: 800px;
  margin: 0 auto;
}

.error {
  color: red;
}

button {
  padding: 5px 20px;
  border: 2px solid #aaaaaa;
  border-radius: 4px;
  font-size: 1em;
  cursor: pointer;
  background: white;

  &:hover {
    background: #eeeeee;
  }

  &:active {
    background: #dddddd;
  }
}
</style>