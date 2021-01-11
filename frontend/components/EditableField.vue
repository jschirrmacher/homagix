<script>
export default {
  props: {
    value: {
      type: String,
      default: '',
    },

    tag: {
      type: String,
      default: 'div',
    },

    placeholder: {
      type: String,
      default: '',
    }
  },

  data() {
    return {
      hasFocus: false,
    }
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: (e) => {
          this.$emit('input', e.target.innerText.trim())
        },
        focus: (e) => {
          this.hasFocus = true
          e.target.innerText = this.value
        },
        blur: (e) => {
          this.hasFocus = false
          if (!e.target.innerText.trim()) {
            e.target.innerText = this.placeholder
          }
        },
      }
    },

    content: {
      get() {
        return this.value || (!this.hasFocus && this.placeholder) || ''
      },
      set(newValue) {
        this.value = newValue
      }
    }
  },
}
</script>

<template>
  <component
    :is="tag"
    ref="editable"
    contenteditable
    v-on="listeners"
  >
    {{ content }}
  </component>
</template>
