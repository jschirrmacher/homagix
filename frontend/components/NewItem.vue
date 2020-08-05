<script>
import { ITEM_ADDED } from '../store/mutation_types'
import { mapState } from 'vuex'
import Autocomplete from './Autocomplete'

const defaultSettings = {
  amount: '',
  unit: 'Stk',
  name: ''
}

export default {
  components: { Autocomplete },

  data() {
    return {
      item: { ...defaultSettings },
      units: ['Stk', 'Pgk', 'g', 'kg', 'ml', 'L', 'Kopf', 'Glas', 'Dose', 'Zehen', 'Würfel'],
    }
  },

  computed: {
    ...mapState(['allIngredients']),
  },

  methods: {
    addItem() {
      this.$store.dispatch(ITEM_ADDED, { item: this.item })
      this.reset()
    },

    nameFieldChanged(name) {
      this.item.name = name
    },

    reset() {
      this.item = { ...this.defaultSettings }
    }
  }
}
</script>

<template>
  <div class="newItem">
    <button class="inline delete" @click="reset">×</button>
    <button class="inline add" @click="addItem">+</button>

    <input type="number" v-model="item.amount" id="newItem-amount">

    <select v-model="item.unit" id="newItem-unit">
      <option v-for="(unit, index) in units" :key="index">{{unit}}</option>
    </select>

    <Autocomplete id="newItem-name"
      :list="this.allIngredients"
      @changed="nameFieldChanged"
      @enter-pressed="addItem"
    />
  </div>
</template>

<style>
input, select {
  font-size: 16px;
  padding: 4px;
}
</style>

<style lang="scss" scoped>
.newItem {
  margin-bottom: 1em;

  @media print {
    display: none;
  }
}

input[type="number"] {
  text-align: right;
}

#newItem-amount {
  width: 50px;
}

#newItem-unit {
  width: 70px;

  option.selected {
    background: #eeeeee;
  }
}

button.add {
  color: green;
}
</style>