export function closeDialogs() {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close())
}

export function openDialog(id) {
  closeDialogs()
  const dialog = document.querySelector('#' + id)
  if (dialog) {
    dialog.querySelector('form').reset()
    dialog.showModal()
  }
  return dialog
}
