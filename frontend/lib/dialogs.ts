import store from '../store'
import { ALERT } from '../store/mutation_types'

export function closeDialogs(): void {
  document
    .querySelectorAll('dialog[open]')
    .forEach(dialog => (dialog as HTMLDialogElement).close())
}

export function openDialog(id: string): HTMLDialogElement {
  closeDialogs()
  const dialog = document.querySelector('#' + id) as HTMLDialogElement
  if (dialog) {
    const form = dialog.querySelector('form')
    form && form.reset()
    dialog.showModal()
  }
  return dialog
}

export function alert(title: string, message: string): void {
  store.commit(ALERT, { title, message })
  openDialog('Alert')
}
