<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState } from 'vuex'
import Ingredient from './Ingredient.vue'
import { SET_ACTIVE_ITEM } from '../store/mutation_types'

type IngredientGroup = {
  id: string
  title: string
}

type Item = {
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
  },
})
</script>

<template>
  <div>
    <div v-for="(group, groupId) in itemGroups" :key="groupId">
      <div class="groupTitle" :class="groupId">{{ group.title }}</div>
      <ul>
        <Ingredient
          v-for="item in group.items"
          :key="item.id"
          :class="{ active: item.id === activeItemId }"
          :item="item"
          :canEditAmount="canEdit(item)"
          @click="setActive(item)"
          @blur="setInactive()"
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
  }
  
  ul {
    li {
      max-height: 24px;
      display: inline-block;
      width: 50%;
    }
  }
}
</style>
