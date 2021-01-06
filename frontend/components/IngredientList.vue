<script>
import { mapState } from 'vuex'
import Ingredient from './Ingredient'
import { SET_ACTIVE_ITEM } from '../store/mutation_types'

export default {
  components: { Ingredient },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
    canEditAmount: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState(['activeItemId']),

    itemGroups() {
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
    setActive(item) {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: item.id })
    },

    setInactive() {
      this.$store.commit(SET_ACTIVE_ITEM, { itemId: null })
    },

    canEdit(item) {
      return this.canEditAmount && item.id === this.activeItemId
    },
  },
}
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
  ul {
    column-count: 2;

    li {
      font-size: 80%;
      max-height: 24px;
    }
  }
}
</style>
