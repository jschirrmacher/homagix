import { existsSync, mkdirSync, unlinkSync, readdirSync, readFileSync, writeFileSync, createReadStream, createWriteStream } from 'fs'
import { resolve } from 'path'
import { Transform } from 'stream'
import es from 'event-stream'
import location from './Location.js'

const { DIRNAME } = location(import.meta.url)

class JsonStringify extends Transform {
  constructor(options = {}) {
    options.objectMode = true
    super(options)
  }

  _transform(event, encoding, done) {
    this.push(JSON.stringify(event) + '\n')
    done()
  }
}

export default ({ basePath, migrationsPath, logger = console }) => {
  const listeners = {}
  let ready
  let changeStream

  function openChangeStream() {
    try {
      changeStream = createWriteStream(eventsFileName, { flags: 'a' })
      changeStream.on('error', logger.error)
    } catch (error) {
      logger.error(error)
    }
  }

  function migrate(basePath, fromVersion, migrators) {
    return new Promise((pResolve, reject) => {
      try {
        const oldEventsFile = resolve(basePath, `events-${fromVersion}.json`)
        if (existsSync(oldEventsFile)) {
          const readStream = createReadStream(oldEventsFile).pipe(es.split()).pipe(es.parse())
          readStream.on('end', pResolve)
          readStream.on('error', error => {
            logger.error(error)
            reject(error)
          })

          migrators
            .reduce((stream, migrator) => stream.pipe(migrator), readStream)
            .pipe(new JsonStringify())
            .pipe(createWriteStream(eventsFileName))
        } else {
          pResolve()
        }
      } catch (error) {
        logger.error(error)
        reject(error)
      }
    })
  }

  function dispatch(event) {
    try {
      (listeners[event.type] || []).forEach(listener => listener(event))
    } catch (error) {
      logger.error(error)
      logger.debug(error.stack)
    }
  }

  if (!existsSync(basePath)) {
    mkdirSync(basePath)
  }
  migrationsPath = migrationsPath || resolve(DIRNAME, 'migrations')
  const versionFile = resolve(basePath, 'state.json')
  const eventsVersionNo = !existsSync(versionFile) ? 0 : JSON.parse(readFileSync(versionFile).toString()).versionNo || 0
  const migrationFiles = (existsSync(migrationsPath) ? readdirSync(migrationsPath) : [])
    .filter(name => parseInt(name) > eventsVersionNo)
    .map(name => resolve(migrationsPath, name))
  const versionNo = eventsVersionNo + migrationFiles.length
  const eventsFileName = resolve(basePath, `events-${versionNo}.json`)
  if (eventsVersionNo < versionNo) {
    logger.info(`Migrating data from ${eventsVersionNo} to ${versionNo}`)
    ready = Promise.all(migrationFiles.map(async file => new (await import(file)).default()))
      .then(migrators => migrate(basePath, eventsVersionNo, migrators)
      .then(() => writeFileSync(versionFile, JSON.stringify({ versionNo })))
      .then(() => logger.info('Migration successful'))
      .then(openChangeStream)
    )
  } else {
    openChangeStream()
    ready = Promise.resolve()
  }    

  return {
    dispatch,

    async replay() {
      try {
        await ready
        const stream = createReadStream(eventsFileName)
          .pipe(es.split())
          .pipe(es.parse())
          .pipe(es.mapSync(event => {
            dispatch(event)
          }))

        return new Promise(resolve => {
          stream.on('end', resolve)
          stream.on('error', logger.error)
        })
      } catch (error) {
        logger.error(error)
      }
    },

    on(type, func) {
      listeners[type.name] = listeners[type.name] || []
      listeners[type.name].push(func)
      return this
    },

    async emit(event) {
      try {
        await ready
        const completeEvent = { ts: new Date(), ...event }
        changeStream.write(JSON.stringify(completeEvent) + '\n')
        dispatch(completeEvent)
      } catch (error) {
        logger.error(error)
      }
    },

    deleteAll() {
      if (existsSync(eventsFileName)) {
        unlinkSync(eventsFileName)
      }
    },

    end() {
      changeStream.end()
    }
  }
}
