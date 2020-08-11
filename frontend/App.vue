<script>
import { mapState } from 'vuex'
import { CLEAR_ERROR, GET_PROPOSALS, GET_INGREDIENTS, STARTDATE_CHANGED } from './store/mutation_types'
import Home from '@/components/Home'

export default {
  components: { Home },
  
  computed: {
    ...mapState(['error']),
    startDate: {
      get() {
        return this.$store.state.startDate.toISOString().replace(/T.*$/, '')
      },
      set(startDate) {
        this.$store.commit(STARTDATE_CHANGED, { startDate })
      }
    }
  },

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
    <div class="title">
      <h1>Homagix</h1>
      Wochenplan beginnend ab <input type="date" v-model="startDate" autocomplete="off">
    </div>

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

.title {
  margin: 0;
  padding: 10px 10px 5px;
  background: linear-gradient(to bottom right, #F0A30A, rgb(240, 205, 10));
  overflow: hidden;

  h1 {
    color: #FFFF00;
    position: relative;
    float: left;
    font-size: 28px;
    margin: 0;
    padding: 0 30px 0 0;

    &:after {
      content: '';
      display: block;
      position: absolute;
      left: .03em;
      top: -.15em;
      width: 0.5em;
      height: 0.5em;
      border: .15em none #FFFF00;
      border-top-style: solid;
      border-left-style: solid;
      transform: rotate(45deg);
    }
  }

  input {
    font: 1em Arial, helvetica, sans-serif;
    border: none;
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