<script lang="ts">
import Vue from 'vue'
import 'vue-router'
import { doFetch } from '../lib/api'
import { CURRENTUSER_SET } from '../store/mutation_types'
import { mapState } from 'vuex'

const invitationMailSubject = 'Einladung zu Homagix'
const invitationMailBody = `Hallo!

ich möchte dich gern einladen, eine gemeinsam Einkaufsliste zu bearbeiten.
Bitte klicke auf den folgenden Link, um die Einladung anzunehmen:

{{ link }}

Viele Grüße
{{ firstName }}`

export default Vue.extend({
  data() {
    return {
      version: process.env.PACKAGE_VERSION,
    }
  },

  computed: {
    ...mapState(['currentUser']),

    loggedIn(): boolean {
      return this.currentUser.id
    },

    accountMenuName(): string {
      if (this.currentUser.id) {
        return this.currentUser.firstName
      } else {
        return 'Info'
      }
    },
  },

  methods: {
    async logout(): Promise<void> {
      await doFetch('get', '/sessions/logout')
      this.$router.push('/').catch(() => {})
      this.$store.commit(CURRENTUSER_SET, {})
    },

    navigate(dest: string): void {
      this.$router.push(dest).catch(() => {})
    },

    invite(): void {
      const vars = {
        link: location.origin + '/register?inviteFrom=' + this.currentUser.id,
        firstName: this.currentUser.firstName,
      }
      function replaceFunc(match) {
        return vars[match.replace(/[\{}\s]*/g, '')] || match
      }
      const body = encodeURIComponent(
        invitationMailBody.replace(/{{\s*(\w+)\s*}}/gs, replaceFunc)
      )
      window.location.href =
        'mailto:?subject=' +
        encodeURIComponent(invitationMailSubject) +
        '&body=' +
        body
    },

    openMenu(event: Event): void {
      (event.target as HTMLElement).closest('.submenu')?.classList.add('open')
    },

    closeMenu(event: Event): void {
      (event.target as HTMLElement).closest('.submenu')?.classList.remove('open')
    },
  },
})
</script>

<template>
  <nav>
    <router-link to="/recipes">Rezepte</router-link>
    <router-link to="/planner">Wochenplan</router-link>
    <div class="submenu right" @click="openMenu" @mouseleave="closeMenu">
      {{ currentUser.firstName || 'Nicht angemeldet' }}
      <ul>
        <li id="version" data-info="version">{{ version }}</li>
        <li v-if="loggedIn" @click="invite">Jemanden einladen</li>
        <li v-if="loggedIn" @click="navigate('/setPassword')">
          Passwort ändern
        </li>
        <li v-if="loggedIn" @click.prevent="logout">Abmelden</li>
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
    content: 'Version ';
  }
}
</style>
