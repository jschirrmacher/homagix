<script>
import showdown from 'showdown'

const converter = new showdown.Converter({
  parseImgDimensions: true,
  simplifiedAutoLink: true,
  openLinksInNewWindow: true,
})

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
    },

    editable: {
      type: Boolean,
      default: true,
    },
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

        input: e => {
          this.$emit('input', converter.makeMarkdown(e.target.innerHTML).replace(/\n\n+/g, '\n'))
        },

        focus: e => {
          this.hasFocus = true
        },

        blur: e => {
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
          return converter.makeHtml(this.value.replace(/\n/g, '\n\n'))
        } else {
          return (!this.hasFocus && this.placeholder) || ''
        }
      },

      set(newValue) {
        this.value = newValue
      },
    },
  },
}
</script>

<template>
  <component
    :is="tag"
    :contenteditable="editable"
    v-on="listeners"
    v-html="content"
  />
</template>

<style lang="scss" scoped>
p {
  margin-top: 0;
}
</style>
