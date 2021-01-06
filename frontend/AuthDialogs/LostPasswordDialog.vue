<script>
import Dialog from '@/dialogs/Dialog'
import { openDialog, closeDialogs, alert } from '@/lib/dialogs'
import { CURRENTUSER_SET } from '@/store/mutation_types'
import sendForm from '@/lib/sendForm'
import DialogFormField from '@/dialogs/DialogFormField'

const defaultMessage =
  'Gib deine E-Mail-Adresse ein, Du erhältst dann eine E-Mail mit einem Link, über den Du Dein Passwort neu setzen kannst.'

export default {
  components: {
    Dialog,
    DialogFormField,
  },

  data() {
    return {
      message: defaultMessage,
      messageType: 'info',
      fields: {
        email: '',
      },
    }
  },

  methods: {
    async sendAccessLink() {
      const result = await sendForm(
        'POST',
        '/accounts/accessLinks',
        this.fields
      )
      if (result.error) {
        this.message = result.error || 'Unerwarteter Fehler'
        this.messageType = 'error'
      } else {
        this.clearError()
        alert(
          'Link versendet',
          'Wenn Du mit der angegebenen Adresse registriert bist, wirst Du bald eine E-Mail mit einem Zugangslink in Deinem Postfach haben. Prüfe bitte auch den Spam-Ordner, falls sie nicht ankommen sollte.'
        )
      }
    },

    clearError() {
      this.message = defaultMessage
      this.messageType = 'info'
    },
  },
}
</script>

<template>
  <Dialog id="LostPasswordDialog" title="Passwort vergessen">
    <p :class="messageType">{{ message }}</p>

    <form @submit.prevent="sendAccessLink">
      <DialogFormField
        label="E-Mail"
        type="email"
        name="email"
        v-model="fields.email"
        autocomplete="current-email"
        :validation="/^[^\s@]+@\S+\.\S+$/"
        validationMessage="Das sieht nicht nach einer gültigen E-Mail-Adresse aus"
      />

      <button type="submit">Link senden</button>
    </form>
  </Dialog>
</template>

<style lang="scss">
#LostPasswordDialog {
  width: 500px;

  label {
    display: flex;

    .label-text {
      width: 100px;
    }
  }
}
</style>
