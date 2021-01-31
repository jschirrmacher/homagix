<script lang="ts">
import Vue from 'vue'
import DialogFormField from '../dialogs/DialogFormField.vue'
import { mapState } from 'vuex'
import sendForm from '../lib/sendForm'
import { CURRENTUSER_SET } from '../store/mutation_types'
import { alert } from '../lib/dialogs'

const defaultMessage =
  'Gib hier 2x ein neues Passwort an, mit dem Du dich künftig anmelden willst.'

export default Vue.extend({
  components: {
    DialogFormField,
  },

  data() {
    return {
      message: defaultMessage,
      messageType: 'info',
      fields: {
        password: '',
        repeat: '',
      },
      marked: [] as string[],
    }
  },

  computed: {
    ...mapState(['currentUser']),
  },

  methods: {
    setMessage(type: string, message: string): void {
      this.messageType = type
      this.message = message
    },

    async changePwd(): Promise<void> {
      this.marked = Object.entries(this.fields)
        .filter(([name, value]) => !value)
        .map(([name, value]) => name)
      if (this.marked.length) {
        this.setMessage('error', 'Es sind noch nicht beide Felder gefüllt')
        return
      }
      if (this.fields.password !== this.fields.repeat) {
        this.marked = ['repeat']
        this.setMessage('error', 'Das Passwort wurde falsch wiederholt')
        return
      }
      const userInfo = await sendForm(
        'PATCH',
        '/accounts/' + this.currentUser.id,
        { password: this.fields.password }
      )
      if (userInfo.error || !userInfo.id) {
        this.message =
          userInfo.error || 'Unerwarteter Fehler beim Passwort ändern'
        this.messageType = 'error'
      } else {
        this.$store.commit(CURRENTUSER_SET, userInfo)
        this.reset()
        alert('Das Passwort wurde geändert')
        this.$router.push('/planner')
      }
    },

    clearError(): void {
      this.setMessage('info', defaultMessage)
      this.marked = []
    },

    reset(): void {
      this.clearError()
      this.fields.password = ''
    },
  },
})
</script>

<template>
  <div id="ChangePasswordView">
    <h2>Passwort ändern</h2>

    <p :class="messageType">{{ message }}</p>

    <form @submit.prevent="changePwd" @keypress="clearError">
      <input
        type="text"
        name="username"
        value="joachim@dilab.co"
        autocomplete="username"
        class="hidden"
      />

      <DialogFormField
        label="Neues Passwort"
        type="password"
        name="password"
        v-model="fields.password"
        autocomplete="new-password"
        :marked="marked.includes('password')"
      />
      <DialogFormField
        label="Passwort wiederholen"
        type="password"
        name="repeat"
        v-model="fields.repeat"
        autocomplete="no"
        :marked="marked.includes('repeat')"
      />

      <button type="submit">Ändern</button>
    </form>
  </div>
</template>

<style lang="scss">
#ChangePasswordView {
  width: 500px;
  max-width: 100%;
  margin: 0 auto;

  .label-text {
    width: 180px;
  }

  button {
    float: right;
  }

  .hidden {
    display: none;
  }
}
</style>
