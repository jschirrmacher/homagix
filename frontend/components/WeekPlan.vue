<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      startDate: new Date().toISOString().replace(/T.*$/, '')
    }
  },

  computed: mapState(['proposals']),
}
</script>

<template>
<div>
  <h2>Wochenplan</h2>
  <p>beginnend ab <input type="date" v-model="startDate" autocomplete="off"></p>

  <ul>
    <li v-for="proposal in proposals" :key="proposal.id">
      <button class="delete" title="Ablehnen">×</button>
      <button class="accept" title="Annehmen">✓</button>
      {{proposal.name}}
      <span class="served">{{proposal.last}}</span>
    </li>
  </ul>
</div>
</template>

<style scoped lang="scss">
ul {
  list-style: none;
  padding: 0;

  @media (min-width: 640px) {
    margin: 1em 0;
  }

  li {
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
}
</style>