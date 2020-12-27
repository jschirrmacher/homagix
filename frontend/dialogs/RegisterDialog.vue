<script>
import Dialog from './Dialog'
import openDialog from '@/lib/openDialog'

const defaultMessage = 'Sag uns, wer Du bist, damit wir deine Planung wieder Dir zuordnen können:'

export default {
  components: {
    Dialog,
  },

  data() {
    return  {
      message: defaultMessage,
      messageType: 'info',
      email: '',
      firstName: '',
      password: '',
    }
  },

  methods: {
    async register() {
      try {
        const headers = {
          'content-type': 'application/json'
        }
        const params = {
          email: this.email,
          firstName: this.firstName,
          password: this.password,
        }
        const response = await fetch('/accounts', { body: JSON.stringify(params), headers, method: 'POST' })
        if (!response.ok) {
          if (response.status === 401) {
            throw Error('Unbekannter Benutzer')
          }
          throw Error(`${response.status} ${response.statusText}`)
        }
        const userInfo = await response.json()
        if (userInfo.loggedIn) {
          this.$router.push('/planner')
        } else {
          throw Error('Not logged in')
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

    login() {
      openDialog('LoginDialog')
    }
  }
}
</script>

<template>
  <Dialog id="RegisterDialog">
    <h2>Als neuer Nutzer registieren</h2>
    <p :class="messageType">{{ message }}</p>

    <form @submit.prevent="register">
      <label>
        E-Mail
        <input type="email" v-model="email" name="email" autocomplete="current-email" @keydown="clearError">
      </label>
      <span class="field-info">An diese Adresse senden wir einen Zugangslink, wenn Du z.B. mal dein Passwort vergessen hast</span>

      <label>
        Vorname
        <input type="text" v-model="firstName" name="firstName" autocomplete="given-name" @keydown="clearError">
      </label>
      <span class="field-info">Sag uns, wie wir Dich anreden sollen. Wir duzen grundsätzlich, das ist hoffetnlich Ok für Dich</span>

      <label>
        Passwort
        <input type="password" v-model="password" name="password" autocomplete="current-password" @keydown="clearError">
      </label>
      <span class="field-info">Dein Kennwort, mit dem wir bei Anmeldungen prüfen können, dass Du es tatsächlich bist</span>

      <button type="submit">Registrieren</button>

      <p class="info">
        Wir verwenden Deine Daten ausschließlich für die Identifikation und Ansprache innerhalb dieser Anwendung. Mit der Registierung erlaubst Du uns, Deine Daten dazu zu speichern.
      </p>

      <br>
      Du hast schon einen Zugang? <a href="#" @click.prevent="login">Zurück zur Anmeldung</a>
    </form>
  </Dialog>
</template>

<style lang="scss" scoped>
  #RegisterDialog {
    width: 500px;
  }

  input {
    width: calc(100% - 120px);
    float: right;
  }

  .info {
    font-size: 14px;
  }

  .field-info {
    display: inline-block;
    width: calc(100% - 120px);
    margin: 0 0 1em 120px;
    font-size: 14px;
  }
</style>