import { fileURLToPath } from 'url'

export default (url) => {
  const FILENAME = typeof __filename !== 'undefined' ? __filename : fileURLToPath(url)
  const DIRNAME = typeof __dirname !== 'undefined' ? __dirname : FILENAME.replace(/[/\\][^/\\]*?$/, '')

  return { FILENAME, DIRNAME }
}