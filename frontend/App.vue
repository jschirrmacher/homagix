<script lang="ts">
import { mapState } from 'vuex'
import {
  CLEAR_ERROR,
  GET_INGREDIENTS,
  GET_UNITS,
  SET_ACTIVE_ITEM,
} from './store/mutation_types'
import Navigation from './components/Navigation.vue'
import LoginDialog from './AuthDialogs/LoginDialog.vue'
import LostPasswordDialog from './AuthDialogs/LostPasswordDialog.vue'
import Alert from './dialogs/Alert.vue'
import EditableIngredientList from './dialogs/EditableIngredientList.vue'

export default {
  components: {
    Navigation,
    LoginDialog,
    LostPasswordDialog,
    Alert,
    EditableIngredientList,
  },

  computed: {
    ...mapState(['error']),
  },

  mounted() {
    this.$store.dispatch(GET_INGREDIENTS)
    this.$store.dispatch(GET_UNITS)
  },

  methods: {
    clearError() {
      this.$store.commit(CLEAR_ERROR)
    },

    deactivateActiveItem() {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: null })
    },
  },
}
</script>

<template>
  <div @click="deactivateActiveItem">
    <div class="title">
      <h1>Homagix</h1>
      <Navigation />
    </div>

    <div v-if="error && error.message" class="error-container">
      <span @click="clearError">×</span>
      {{ error.message }}
    </div>

    <div class="content">
      <router-view></router-view>
    </div>

    <Alert />
    <LoginDialog />
    <LostPasswordDialog />
    <EditableIngredientList />
  </div>
</template>

<style lang="scss">
html,
body {
  font-family: Arial, Helvetica, sans-serif;
  padding: 0;
  margin: 0;
  line-height: 1.3;
}

.title {
  margin: 0;
  padding: 10px 10px 5px;
  background: linear-gradient(to bottom right, #f0a30a, rgb(240, 205, 10));
  overflow: hidden;

  h1 {
    color: #ffff00;
    position: relative;
    float: left;
    font-size: 28px;
    margin: 0;
    padding: 0 30px 0 0;

    &:after {
      content: '';
      display: block;
      position: absolute;
      left: -0.3px;
      top: -0.07em;
      width: 0.55em;
      height: 0.55em;
      border: 0.19em none #ffff00;
      border-top-style: solid;
      border-left-style: solid;
      transform: scale(1, 0.66) rotate(45deg);
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
  padding: 10px 1em;
}

.error {
  color: red;
}

.error-container {
  border: 2px solid red;
  margin: 10px;
  padding: 10px;

  span {
    cursor: pointer;
  }
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

@media print {
  @page {
    size: A4 portrait;
  }

  h1 {
    padding: 10px;
  }

  button,
  .group {
    display: none;
  }
}
</style>
