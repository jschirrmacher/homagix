<script lang="ts">
import { openDialog } from '../lib/dialogs'
import { CURRENTUSER_SET } from '../store/mutation_types'
import sendForm from '../lib/sendForm'
import DialogFormField from '../dialogs/DialogFormField.vue'
import 'vue-router'

const defaultMessage =
  'Sag uns, wer Du bist, damit wir Deine Planung wieder Dir zuordnen können:'

export default {
  components: {
    DialogFormField,
  },

  data() {
    return {
      message: defaultMessage,
      messageType: 'info',
      fields: {
        email: '',
        firstName: '',
        password: '',
        inviteFrom:
          window.location.search &&
          window.location.search.match(/inviteFrom=(\w*)/) &&
          RegExp.$1,
      },
      requiredFields: ['email', 'firstName', 'password'],
      marked: [] as string[],
    }
  },

  methods: {
    async register() {
      this.marked = Object.entries(this.fields)
        .filter(([name, value]) => this.requiredFields.includes(name) && !value)
        .map(([name, value]) => name)
      if (this.marked.length) {
        this.message = 'Es sind noch nicht alle Felder gefüllt'
        this.messageType = 'error'
        return
      }
      const userInfo = await sendForm('POST', '/accounts', this.fields, {
        409: 'Du bist bereits registriert - melde dich doch einfach an!',
      })
      if (userInfo.error || !userInfo.id) {
        this.message = userInfo.error as string || 'Unerwarteter Fehler beim Registrieren'
        this.messageType = 'error'
      } else {
        this.$store.commit(CURRENTUSER_SET, { currentUser: userInfo })
        this.reset()
        this.$router.push('/planner')
      }
    },

    clearError() {
      this.message = defaultMessage
      this.messageType = 'info'
      this.marked = []
    },

    reset() {
      this.clearError()
      this.fields.password = ''
    },

    login() {
      this.reset()
      openDialog('LoginDialog')
    },
  },
}
</script>

<template>
  <div id="RegisterDialog">
    <h2>Als neuer Nutzer registieren</h2>
    <p :class="messageType">{{ message }}</p>

    <form @submit.prevent="register" @keypress="clearError">
      <DialogFormField
        label="E-Mail"
        type="email"
        name="email"
        v-model="fields.email"
        autocomplete="current-email"
        :marked="marked.includes('email')"
        :validation="/^[^\s@]+@\S+\.\S+$/"
        validationMessage="Das sieht nicht nach einer gültigen E-Mail-Adresse aus"
        defaultInfo="An diese Adresse senden wir einen Zugangslink, falls Du mal Dein Passwort vergessen hast"
      />
      <DialogFormField
        label="Vorname"
        type="text"
        name="firstName"
        v-model="fields.firstName"
        autocomplete="given-name"
        :marked="marked.includes('firstName')"
        defaultInfo="Sag uns, wie wir Dich anreden sollen. Wir duzen grundsätzlich, das ist hoffentlich Ok für Dich"
      />
      <DialogFormField
        label="Passwort"
        type="password"
        name="password"
        v-model="fields.password"
        autocomplete="current-password"
        :marked="marked.includes('password')"
        defaultInfo="Vergib' ein Passwort, um Deinen Zugang zu schützen"
      />

      <button type="submit">Registrieren</button>

      <p class="info">
        Wir verwenden Deine Daten ausschließlich für die Identifikation und
        Ansprache innerhalb dieser Anwendung. Mit der Registierung erlaubst Du
        uns, Deine Daten dazu zu speichern.
      </p>

      <p>
        Du hast schon einen Zugang?
        <a href="#" @click.prevent="login">Zur Anmeldung</a>
      </p>
    </form>
  </div>
</template>

<style lang="scss">
#RegisterDialog {
  width: 500px;
  margin: 0 auto;

  label {
    display: flex;

    .label-text {
      flex: 0 0 100px;
    }
  }

  .info {
    font-size: 14px;
  }
}
</style>
