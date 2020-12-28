<script>
import Dialog from './Dialog'
import { openDialog, closeDialogs } from '@/lib/dialogs'
import { CURRENTUSER_SET } from '../store/mutation_types'

const defaultMessage = 'Gib deine E-Mail-Adresse und dein Passwort ein, um Zugriff auf deine Daten zu erhalten'

export default {
  components: {
    Dialog,
  },

  data() {
    return  {
      message: defaultMessage,
      messageType: 'info',
      email: '',
      password: '',
    }
  },

  methods: {
    async login() {
      try {
        const headers = {
          'content-type': 'application/json'
        }
        const params = {
          email: this.email,
          password: this.password,
        }
        const response = await fetch('/sessions', { body: JSON.stringify(params), headers, method: 'POST' })
        if (!response.ok) {
          if (response.status === 401) {
            throw Error('Unbekannter Benutzer')
          }
          throw Error(`${response.status} ${response.statusText}`)
        }
        const userInfo = await response.json()
        if (userInfo.id) {
          closeDialogs()
          this.$store.commit(CURRENTUSER_SET, userInfo)
          this.password = ''
          this.$router.push('/planner')
        } else {
          throw Error('Unerwarteter Fehler beim Anmelden')
        }
      } catch (error) {
        this.message = error.message
        this.messageType = 'error'
      }
    },

    clearError() {
      this.message = defaultMessage
      this.messageType = 'info'
    },

    register() {
      this.password = ''
      openDialog('RegisterDialog')
    }
  }
}
</script>

<template>
  <Dialog id="LoginDialog">
    <h2>Anmelden</h2>
    <p :class="messageType">{{ message }}</p>

    <form @submit.prevent="login">
      <label>
        E-Mail
        <input type="text" v-model="email" name="email" autocomplete="current-email" @keydown="clearError">
      </label>

      <label>
        Passwort
        <input type="password" v-model="password" name="password" autocomplete="current-password" @keydown="clearError">
      </label>

      <button type="submit">Anmelden</button>

      <!--br>
      <a href="#" @click="close">Passwort vergessen?</a-->
      <br>
      Neu hier? <a href="#" @click.prevent="register">Hier Registrieren</a>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
  #LoginDialog {
    width: 500px;
  }

  input {
    width: calc(100% - 100px);
    float: right;
  }
</style>