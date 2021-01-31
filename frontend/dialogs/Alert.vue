<script lang="ts">
import Dialog from './Dialog.vue'
import { closeDialogs } from '../lib/dialogs'
import { mapState } from 'vuex'

export default {
  components: {
    Dialog,
  },

  computed: mapState(['alert']),

  methods: {
    close(): void {
      closeDialogs()
    },
  },
}
</script>

<template>
  <Dialog id="Alert" :title="alert.title">
    <p>{{ alert.message }}</p>

    <button @click="close">Ok</button>
  </Dialog>
</template>

<style lang="scss">
#Alert {
  width: 500px;
}
</style>
