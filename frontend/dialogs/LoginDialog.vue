<script>
import Dialog from './Dialog'
import { openDialog, closeDialogs } from '@/lib/dialogs'
import { CURRENTUSER_SET } from '../store/mutation_types'
import sendForm from '../lib/sendForm'
import DialogFormField from './DialogFormField'

const defaultMessage = 'Gib deine E-Mail-Adresse und dein Passwort ein, um Zugriff auf deine Daten zu erhalten'

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
        password: '',
      },
    }
  },

  methods: {
    async login() {
      const userInfo = await sendForm('POST', '/sessions', this.fields, { 401: 'Unbekannter Benutzer' })
      if (userInfo.error || !userInfo.id) {
        this.message = userInfo.error || 'Unerwarteter Fehler beim Anmelden'
        this.messageType = 'error'
      } else {
        closeDialogs()
        this.$store.commit(CURRENTUSER_SET, userInfo)
        this.fields.password = ''
        this.$router.push('/planner')
      }
    },

    clearError() {
      this.message = defaultMessage
      this.messageType = 'info'
    },

    register() {
      this.fields.password = ''
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
      <DialogFormField label="E-Mail" type="email" name="email" v-model="fields.email" autocomplete="current-email" :validation="/^[^\s@]+@\S+\.\S+$/" validationMessage="Das sieht nicht nach einer gültigen E-Mail-Adresse aus" />
      <DialogFormField label="Passwort" type="password" name="password" v-model="fields.password" autocomplete="current-password" />

      <button type="submit">Anmelden</button>

      <!--br>
      <a href="#" @click="close">Passwort vergessen?</a-->
      <br>
      Neu hier? <a href="#" @click.prevent="register">Hier Registrieren</a>
    </form>
  </Dialog>
</template>

<style lang="scss">
#LoginDialog {
  width: 500px;

  label {
    display: flex;

    .label-text {
      width: 100px;
    }
  }
}
</style>