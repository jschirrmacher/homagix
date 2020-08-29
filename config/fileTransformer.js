import path from 'path'

export default {
  process(src, filename) {
    return 'export default ' + JSON.stringify(path.basename(filename))
  }
}
