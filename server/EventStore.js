const { existsSync, mkdirSync, unlinkSync, readdirSync, readFileSync, writeFileSync, createReadStream, createWriteStream } = require('fs')
const { resolve } = require('path')
const { Transform } = require('stream')
const es = require('event-stream')

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

module.exports = ({ basePath, migrationsPath, logger = console }) => {
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

  function migrate(basePath, fromVersion, migrationFiles) {
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

          migrationFiles
            .map(migration => require(migration))
            .reduce((stream, migrator) => stream.pipe(new migrator()), readStream)
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
  migrationsPath = migrationsPath || resolve(__dirname, 'migrations')
  const versionFile = resolve(basePath, 'state.json')
  const eventsVersionNo = !existsSync(versionFile) ? 0 : JSON.parse(readFileSync(versionFile).toString()).versionNo || 0
  const migrationFiles = readdirSync(migrationsPath)
    .filter(name => parseInt(name) > eventsVersionNo)
    .map(name => resolve(migrationsPath, name))
  const versionNo = eventsVersionNo + migrationFiles.length
  const eventsFileName = resolve(basePath, `events-${versionNo}.json`)
  if (eventsVersionNo < versionNo) {
    logger.info(`Migrating data from ${eventsVersionNo} to ${versionNo}`)
    ready = migrate(basePath, eventsVersionNo, migrationFiles)
      .then(() => writeFileSync(versionFile, JSON.stringify({ versionNo })))
      .then(() => logger.info('Migration successful'))
      .then(openChangeStream)
  } else {
    openChangeStream()
    ready = Promise.resolve()
  }    

  return {
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
