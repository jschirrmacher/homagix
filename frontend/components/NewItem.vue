<script lang="ts">
import Vue from 'vue'
import { ADD_ITEM } from '../store/mutation_types'
import { mapState } from 'vuex'
import Autocomplete from './Autocomplete.vue'

type Item = {
  id: string
  name: string
  amount: string
  unit: {
    name: string
    step: number
  }
}

const defaultSettings = {
  id: '',
  name: '',
  amount: '1',
  unit: {
    name: 'Pkg',
    step: 1
  },
}

export default Vue.extend({
  components: { Autocomplete },

  data() {
    return {
      item: { ...defaultSettings } as Item,
    }
  },

  computed: {
    ...mapState(['allIngredients', 'units']),
  },

  methods: {
    addItem(): void {
      const item = {
        id: this.item.id,
        name: this.item.name,
        amount: this.item.amount,
        unit: this.item.unit.name,
      }
      this.$store.dispatch(ADD_ITEM, { item })
      this.reset()
    },

    nameFieldChanged(item: Item): void {
      this.item = {
        ...this.item,
        ...item,
        unit:
          this.$store.state.units.find((u) => u.name === item.unit) ||
          this.item.unit,
      }
    },

    reset(): void {
      this.item = { ...defaultSettings }
    },
  },
})
</script>

<template>
  <div class="newItem">
    <button class="inline delete" @click="reset">×</button>
    <button class="inline add" @click="addItem">+</button>

    <input
      type="number"
      :step="item.unit.step"
      min="0"
      v-model="item.amount"
      id="newItem-amount"
    />

    <select v-model="item.unit" id="newItem-unit" :disabled="!!item.id">
      <option v-for="(unit, index) in units" :key="index" :value="unit">
        {{ unit.name }}
      </option>
    </select>

    <Autocomplete
      id="newItem-name"
      :list="this.allIngredients"
      :value="this.item.name"
      @input="nameFieldChanged"
      @enter-pressed="addItem"
    />
  </div>
</template>

<style>
input,
select {
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

input[type='number'] {
  text-align: right;
}

#newItem-amount {
  width: 50px;
}

#newItem-unit {
  width: 70px;
  text-align: right;

  option.selected {
    background: #eeeeee;
  }
}

button.add {
  color: green;
}
</style>
