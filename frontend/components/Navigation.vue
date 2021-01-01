<script>
import Vue from 'vue'
import { doFetch } from '@/lib/api'
import { CURRENTUSER_SET } from '../store/mutation_types'
import { mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      version: process.env.PACKAGE_VERSION,
    }
  },

  computed: {
    ...mapState(['currentUser']),

    loggedIn() {
      return this.currentUser.id
    },

    accountMenuName() {
      if (this.currentUser.id) {
        return this.currentUser.firstName
      } else {
        return 'Info'
      }
    }
  },

  methods: {
    async logout() {
      await doFetch('get', '/sessions/logout')
      this.$router.push('/').catch(() => {})
      this.$store.commit(CURRENTUSER_SET, {})
    },

    changePwd() {
      this.$router.push('/setPassword').catch(() => {})
    },

    openMenu(event) {
      event.target.closest('.submenu').classList.add('open')
    },

    closeMenu(event) {
      event.target.closest('.submenu').classList.remove('open')
    }
  }
})
</script>

<template>
  <nav>
    <router-link to="/recipes">Rezepte</router-link>
    <router-link to="/planner">Wochenplan</router-link>
    <div class="submenu right" @click="openMenu" @mouseleave="closeMenu">
      {{ currentUser.firstName || 'Nicht angemeldet' }}
      <ul>
        <li v-if="loggedIn" @click.prevent="logout" >Abmelden</li>
        <li v-if="loggedIn" @click="changePwd" >Passwort ändern</li>
        <li v-if="loggedIn" @click="invite" >Jemanden einladen</li>
        <li id="version" data-info="version">{{ version }}</li>
      </ul>
    </div>
  </nav>
</template>

<style scoped lang="scss">
  nav {
    display: block;
    padding-top: 10px;

    .submenu {
      cursor: pointer;

      &:before {
        content: '▾';
      }

      &.right {
        float: right;

        ul {
          left: auto;
          right: 0;
        }
      }

      &.open ul {
        display: block;
      }

      ul {
        display: none;
        position: absolute;
        z-index: 10000;
        list-style: none;
        left: 0;
        border: 1px solid #aaaaaa;
        margin-top: 0;
        box-shadow: 0 0 4px #aaaaaa;

        li {
          background: white;
          padding: 7px;

          &:not([data-info]):hover {
            background: #eeeeee;
          }

          &[data-info] {
            cursor: default;
          }
        }
      }
    }
  }

  a {
    color: white;
    text-decoration: none;
    margin-right: 10px;

    &:hover {
      color: #dddddd;
    }
  }

  #version {
    &:before {
      content: 'Version '
    }
  }
</style>
