import path from 'path'
import fs from 'fs'

export default function ({ basePath, logger = console }) { 
  return {
    cleanup() {
      fs.rmdirSync(basePath, { recursive: true })
    },

    setupFiles(list) {
      Object.entries(list).forEach(([location, content]) => {
        try {
          const dir = path.resolve(basePath, location, '..')
          fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(path.resolve(basePath, location), content)
        } catch (error) {
          logger.error(error)
        }
      })
    }
  }
}
