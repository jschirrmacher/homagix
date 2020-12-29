<script>
import dialogPolyfill from 'dialog-polyfill'

export default {
  props: {
    id: String,
    defaultMessage: String,
  },

  data() {
    return {
      message: this.defaultMessage,
      messageType: 'info',
    }
  },

  mounted() {
    dialogPolyfill.registerDialog(this.$refs.dialog)
  },

  methods: {
    close() {
      this.$refs.dialog.close()
    }
  }
}
</script>

<template>
  <dialog :id="id" ref="dialog">
    <span class="close-box" @click="close">×</span>
    
    <div @close="close">
      <slot />
    </div>
  </dialog>
</template>

<style lang="scss">
  dialog {
    position: fixed;
    top: 50%;
    transform: translate(0, -50%);
    border: 1px solid #aaaaaa;
    border-radius: 8px;
    box-shadow: 3px 3px 5px #555555;
    padding: 20px;

    button {
      float: right;
      margin: 1em 10px;
    }

    &::backdrop,
    & + .backdrop {
      background: rgba(0, 0, 0, .6)
    }

    .close-box {
      float: right;
      font-size: 24px;
      position: relative;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      text-align: center;
      line-height: 1.3em;
      transition: all .3s;

      &:hover {
        background: #eeeeee;
      }
    }
  }
</style>