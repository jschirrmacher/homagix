<script>
export default {
  props: {
    id: {
      type: Number,
    },
    name: {
      type: String,
    },
    lastServed: {
      type: String,
    }
  },

  computed: {
    served() {
      return this.lastServed && (new Date(this.lastServed)).toLocaleString('de', { dateStyle: 'medium' })
    }
  }
}
</script>

<template>
  <div class="dish">
    <button class="delete" title="Ablehnen">×</button>
    <button class="accept" title="Annehmen">✓</button>
    {{name}}
    <span class="served">{{served}}</span>
  </div>
</template>

<style lang="scss" scoped>
.dish {
  padding: 10px 0;
  border-bottom: 1px solid #bbbbbb;
  position: relative;
  cursor: pointer;
  line-height: 1.4em;

  button {
    right: 0;
    float: right;
    padding: 3px 3px 5px;
    background: none;
    position: relative;
    top: -0.4em;
    right: -10px;
    font-size: 1.6em;
    border: none;
    cursor: pointer;

    &:hover {
      background: #dddddd;
    }

    &::active {
      background: #bbbbbb;
    }

    &.delete {
      color: red;
    }

    &.accept {
      color: lightgray;
    }
  }

  .served {
    background: #aaaaaa;
    position: relative;
    right: 50px;
    padding: 2px 5px;
    border-radius: 4px;
    color: white;
    font-size: 80%;
    vertical-align: text-top;
    margin-left: 1em;
    float: right;
    margin-right: -50px;
  }
}
</style>