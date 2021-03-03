<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<template>
  <button
    class="inline delete"
    title="Von der Liste streichen"
    @click="$emit('click', $event)"
  >
    ×
  </button>
</template>
