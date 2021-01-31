<script lang="ts">
import Vue, { PropType } from 'vue'

type Item = { name: string }

export default Vue.extend({
  props: {
    id: {
      type: String,
    },
    list: {
      type: Array as PropType<Item[]>,
      default: () => [],
    },
    value: {
      type: String,
    },
  },

  data() {
    return {
      selectedIndex: -1,
      suggestions: [] as Item[],
    }
  },

  computed: {
    search: {
      get(): string {
        return this.value
      },

      set(value: string): void {
        const item = this.list.find(item => item.name === value) || {
          id: null,
          name: value,
        }
        this.$emit('input', item)
      },
    },
  },

  methods: {
    activeDescendant(): number | undefined {
      return this.selectedIndex >= 0 ? this.selectedIndex : undefined
    },

    itemClass(index: number): string {
      return index === this.selectedIndex ? 'selected' : ''
    },

    reset(): void {
      this.suggestions = []
      this.selectedIndex = -1
    },

    selectItem(event: Event): void {
      const target = event.target as HTMLElement
      this.search = this.suggestions[target.dataset.index || 0].name
      this.reset()
    },

    handleKey(event: { code: string }): void {
      if (['ArrowDown', 'ArrowUp'].includes(event.code)) {
        const direction = event.code === 'ArrowDown' ? 1 : -1
        this.selectedIndex = Math.max(
          -1,
          Math.min(this.list.length - 1, this.selectedIndex + direction)
        )
      } else if ('Enter' === event.code) {
        if (this.selectedIndex >= 0) {
          this.search = this.suggestions[this.selectedIndex].name
        }
        this.reset()
        this.search && this.$emit('enter-pressed')
      } else {
        this.updateSuggestions()
      }
    },

    updateSuggestions(): void {
      const pattern = new RegExp(this.search, 'i')
      this.suggestions = this.list.filter(item => item.name.match(pattern))
    },
  },
})
</script>

<template>
  <div class="autocomplete" :id="id">
    <input
      type="text"
      v-model="search"
      @keyup="handleKey"
      role="combobox"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      :aria-owns="this.id + '-result-list'"
      aria-expanded="false"
      :aria-activedescendant="activeDescendant"
    />
    <ul role="listbox" id="newItem-name-autocomplete-result-list">
      <li
        v-for="(item, index) in suggestions"
        :key="item.id"
        @click="selectItem"
        :class="itemClass(index)"
        :data-index="index"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
#newItem-name {
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  width: calc(100% - 50px - 70px - 88px);

  input {
    width: 100%;
  }

  input:focus + ul,
  ul:hover {
    display: inline;
  }

  ul {
    display: none;
    position: absolute;
    top: 100%;
    width: 100%;
    max-height: 10em;
    overflow: auto;
    background: white;
    margin: -2px 0 0;
    border: 1px solid #888888;

    li {
      padding: 4px;

      &:hover,
      &.selected {
        background: #eeeeee;
      }
    }
  }
}
</style>
