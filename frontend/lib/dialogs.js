import store from '../store'
import { ALERT } from '../store/mutation_types'

export function closeDialogs() {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close())
}

export function openDialog(id) {
  closeDialogs()
  const dialog = document.querySelector('#' + id)
  if (dialog) {
    const form = dialog.querySelector('form')
    form && form.reset()
    dialog.showModal()
  }
  return dialog
}

export function alert(title, message) {
  store.commit(ALERT, { title, message })
  openDialog('Alert')
}
