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
        if (this.value) {
          return this.value.split(/\n+/).join('<br><br>')
        } else {
          return (!this.hasFocus && this.placeholder) || ''
        }
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
    v-html="content"
  />
</template>

<style lang="scss" scoped>
  p {
    margin-top: 0;
  }
</style>