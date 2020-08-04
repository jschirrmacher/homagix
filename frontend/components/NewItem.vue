<script>
import { ITEM_ADDED } from '../store/mutation_types'
import { mapState } from 'vuex'

const defaultSettings = {
  amount: '',
  unit: 'Stk',
  name: ''
}
export default {
  data() {
    return {
      ...defaultSettings,
      selected: null,
      list: [],
      selectedIndex: null,
      units: ['Stk', 'Pgk', 'g', 'kg', 'ml', 'L', 'Kopf', 'Glas', 'Dose', 'Zehen', 'Würfel'],
    }
  },

  computed: {
    ...mapState(['allIngredients']),
  },

  methods: {
    updateNewItem(event) {
      const pattern = new RegExp(event.target.value, 'i')
      this.list = this.allIngredients.filter(item => item.name.match(pattern))
    },

    key(event) {
      const direction = (event.code === 'ArrowDown') ? 1 : -1
      this.selectedIndex = (this.selectedIndex === null ? -1 : this.selectedIndex) + direction
    },

    unitClass(index) {
      return index === this.selectedIndex ? 'selected' : ''
    },

    selectItem(event) {
      const itemName = event.target.innerText.toLowerCase()
      const item = this.allIngredients.find(item => item.name.toLowerCase() === itemName)
      this.selected = item.id
      this.name = item.name
      this.unit = item.unit
      this.amount = this.amount || 1
      this.list = []
    },

    addItem() {
      const item = {
        id: this.selectedItemId,
        amount: this.amount,
        unit: this.unit,
        name: this.name,
      }
      this.$store.dispatch(ITEM_ADDED, { item })
      this.reset()
    },

    reset() {
      this.selected = null
      this.name = defaultSettings.name
      this.amount = defaultSettings.amount
      this.unit = defaultSettings.unit
      this.list = []
      this.selectedIndex = null
    }
  }
}
</script>

<template>
  <div class="newItem">
    <button class="inline delete" @click="reset">×</button>
    <button class="inline add" @click="addItem">+</button>

    <input type="number" v-model="amount" id="newItem-amount">

    <select v-model="unit" id="newItem-unit">
      <option v-for="(unit, index) in units" :key="index">{{unit}}</option>
    </select>

    <div class="autocomplete" id="newItem-name" @keyup.enter="addItem">
      <input type="text" v-model="name" @keyup="updateNewItem" @keyup.up.prevent="key" @keyup.down.prevent="key">
      <ul class="autocomplete">
        <li v-for="(item, index) in list" :key="item.id" @click="selectItem" :class="unitClass(index)">{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.newItem {
  margin-bottom: 1em;

  @media print {
    display: none;
  }
}

input, select {
  font-size: 16px;
  padding: 4px;
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

#newItem-name {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: calc(100% - 50px - 70px - 88px);

  input {
    width: 100%;
  }

  input:focus + ul, ul:hover {
    display: inline;
  }

  ul {
    display: none;
    position: absolute;
    top: calc(100% - 1px);
    width: 100%;
    max-height: 10em;
    overflow: auto;
    background: white;
    margin: 0;
    border: 1px solid #888888;

    li {
      padding: 4px;

      &:hover, &.selected {
        background: #eeeeee;
      }
    }
  }
}

button.add {
  color: green;
}
</style>