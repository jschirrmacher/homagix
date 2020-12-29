<script>
import Dialog from './Dialog'
import { openDialog, closeDialogs } from '@/lib/dialogs'
import { CURRENTUSER_SET } from '../store/mutation_types'
import sendForm from '../lib/sendForm'
import DialogFormField from './DialogFormField'

const defaultMessage = 'Sag uns, wer Du bist, damit wir deine Planung wieder Dir zuordnen können:'

export default {
  components: {
    Dialog,
    DialogFormField,
  },

  data() {
    return  {
      message: defaultMessage,
      messageType: 'info',
      fields: {
        email: '',
        firstName: '',
        password: '',
      },
      marked: {
        email: false,
        firstName: false,
        password: false,
      },
    }
  },

  methods: {
    async register() {
      const emptyFields = Object.entries(this.fields).filter(([name, value]) => !value).map(([name, value]) => name)
      if (emptyFields.length) {
        emptyFields.forEach(fieldName => this.marked[fieldName] = true)
        this.message = 'Es sind noch nicht alle Felder gefüllt'
        this.messageType = 'error'
        return
      }
      const userInfo = await sendForm('POST', '/accounts', this.fields, { 409: 'Du bist bereits registriert - melde dich doch einfach an!' })
      if (userInfo.error || !userInfo.id) {
        this.message = userInfo.error || 'Unerwarteter Fehler beim Registrieren'
        this.messageType = 'error'
      } else {
        closeDialogs()
        this.$store.commit(CURRENTUSER_SET, userInfo)
        this.$router.push('/planner')
      }
    },

    clearError() {
      this.message = defaultMessage
      this.messageType = 'info'
      Object.keys(this.marked).forEach(field => this.marked[field] = false)
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

    <form @submit.prevent="register" @keypress="clearError">
      <DialogFormField label="E-Mail" type="email" name="email" v-model="fields.email" autocomplete="current-email" :marked="marked['email']"
        :validation="/^[^\s@]+@\S+\.\S+$/"
        validationMessage="Das sieht nicht nach einer gültigen E-Mail-Adresse aus"
        defaultInfo="An diese Adresse senden wir einen Zugangslink, falls Du mal dein Passwort vergessen hast"
      />
      <DialogFormField label="Vorname" type="text" name="firstName" v-model="fields.firstName" autocomplete="given-name" :marked="marked['firstName']"
        defaultInfo="Sag uns, wie wir Dich anreden sollen. Wir duzen grundsätzlich, das ist hoffetnlich Ok für Dich"
      />
      <DialogFormField label="Passwort" type="password" name="password" v-model="fields.password" autocomplete="current-password" :marked="marked['password']"
        defaultInfo="Dein Kennwort, mit dem wir bei Anmeldungen prüfen können, dass Du es tatsächlich bist"
      />

      <button type="submit">Registrieren</button>

      <p class="info">
        Wir verwenden Deine Daten ausschließlich für die Identifikation und Ansprache innerhalb dieser Anwendung. Mit der Registierung erlaubst Du uns, Deine Daten dazu zu speichern.
      </p>

      <br>
      Du hast schon einen Zugang? <a href="#" @click.prevent="login">Zurück zur Anmeldung</a>
    </form>
  </Dialog>
</template>

<style lang="scss">
#RegisterDialog {
  width: 500px;

  label {
    display: flex;

    .label-text {
      flex: 0 0 120px;
    }
  }

  .info {
    font-size: 14px;
  }
}
</style>