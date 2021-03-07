<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import Ingredient from './Ingredient.vue'
import { SET_ACTIVE_ITEM, UPDATE_AMOUNT } from '../store/mutation_types'
import { CompleteItem } from '../app-types'

type IngredientGroup = {
  id: string
  title: string
}

export type Item = {
  id: string
  name: string
  group: IngredientGroup
}

export default Vue.extend({
  components: { Ingredient },

  props: {
    items: {
      type: Array as PropType<Item[]>,
      default: () => [],
    },
    canEditAmount: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState(['activeItemId']),

    itemGroups(): Record<string, IngredientGroup> {
      const groups = {}
      let currentGroup = ''
      this.items.forEach(item => {
        if (item.group.id !== currentGroup) {
          currentGroup = item.group.id
          groups[currentGroup] = { title: item.group.title, items: [] }
        }
        groups[currentGroup].items.push(item)
      })
      return groups
    },
  },

  methods: {
    setActive(item: Item): void {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: item.id })
    },

    setInactive(): void {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: null })
    },

    canEdit(item: Item): boolean {
      return this.canEditAmount && item.id === this.activeItemId
    },

    updateAmount(item: Item, newAmount: number) {
      return this.$store.dispatch(UPDATE_AMOUNT, { item, newAmount })
    },

    cssClass(groupId: string, items: CompleteItem[]): Record<string, boolean> {
      return {
        groupTitle: true,
        groupId: !!groupId,
        empty: !items.some(i => i.amount > 0)
      }
    },
  },
})
</script>

<template>
  <div>
    <div v-for="(group, groupId) in itemGroups" :key="groupId">
      <div :class="cssClass(groupId, group.items)">
        {{ group.title }}
      </div>
      <ul>
        <Ingredient
          v-for="item in group.items"
          :key="item.id"
          :class="{ active: item.id === activeItemId }"
          :item="item"
          :canEditAmount="canEdit(item)"
          @click="setActive(item)"
          @blur="setInactive()"
          @update="amount => updateAmount(item, amount)"
        >
          <slot v-bind:item="item" />
        </Ingredient>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
ul {
  margin: 0;
}

@media print {
  .groupTitle {
    border-top: 1px solid black;

    &.empty {
      display: none;
    }
  }

  ul {
    li {
      display: inline-flex;
      width: 50%;
    }
  }
}
</style>
