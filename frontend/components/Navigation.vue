<script>
import Vue from 'vue'
import { doFetch } from '@/lib/api'
import { CURRENTUSER_SET } from '../store/mutation_types'

export default Vue.extend({
  computed: {
    loggedIn() {
      return this.$store.state.currentUser.id
    }
  },

  methods: {
    async logout() {
      await doFetch('get', '/sessions/logout')
      this.$router.push('/').catch(() => {})
      this.$store.commit(CURRENTUSER_SET, {})
    }
  }
})
</script>

<template>
  <nav>
    <router-link to="/recipes">Rezepte</router-link>
    <router-link to="/planner">Wochenplan</router-link>
    <a v-if="loggedIn" href="#" @click.prevent="logout" id="logout">Abmelden</a>
  </nav>
</template>

<style scoped lang="scss">
  nav {
    display: block;
    padding-top: 10px;
  }

  a {
    color: white;
    text-decoration: none;
    margin-right: 10px;

    &:hover {
      color: #dddddd;
    }

    &#logout {
      position: absolute;
      right: 0;
      top: 5px;
    }
  }
</style>
