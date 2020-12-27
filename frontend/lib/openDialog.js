export default (id) => {
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close())
  document.querySelector('#' + id).showModal()
}
