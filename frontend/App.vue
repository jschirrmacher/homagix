<script>
import { mapState } from 'vuex'
import { CLEAR_ERROR, GET_PROPOSALS, GET_INGREDIENTS } from './store/mutation_types'
import Home from '@/components/Home'

export default {
  components: { Home },
  
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
      <Home />
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
  max-width: 800px;
  margin: 0 auto;
}

.error {
  color: red;
}

ul {
  list-style: none;
  padding: 0;
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

button.inline {
  float: right;
  padding: 2px 1px 5px 2px;
  margin-left: 5px;
  background: none;
  position: relative;
  top: -1px;
  height: 30px;
  width: 24px;
  font-size: 1.6em;
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: #dddddd;
  }

  &::active {
    background: #bbbbbb;
  }

  &.delete {
    color: red;
  }
}
</style>