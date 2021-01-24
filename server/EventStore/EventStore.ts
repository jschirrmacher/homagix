import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  createReadStream,
  createWriteStream,
} from 'fs'
import { resolve } from 'path'
import { Transform, TransformOptions } from 'stream'
import es from 'event-stream'

type Logger = {
  error: (msg: unknown) => void
  info: (msg: unknown) => void
  debug: (msg: unknown) => void
}

export type EventType = { name: string }
export type Event = Record<string, unknown>
export type Listener = (event: Event) => void

export type Store = {
  dispatch(event: Event): void
  replay(): Promise<void>
  on(type: EventType, func: Listener): Store
  emit(event: Event): Promise<void>
  end(): void
}

class JsonStringify extends Transform {
  constructor(options = {} as TransformOptions) {
    options.objectMode = true
    super(options)
  }

  _transform(event: unknown, encoding: BufferEncoding, done: () => void) {
    this.push(JSON.stringify(event) + '\n')
    done()
  }
}

export default ({ basePath, migrationsPath, logger = console }: { basePath: string, migrationsPath: string, logger?: Logger }): Store => {
  const listeners = {} as Record<string, Listener[]>
  const eventFile = (version: number) => resolve(basePath, `events-${version}.json`)

  async function migrate(from: number, to: number, migrators: WritableStream[]): Promise<void> {
    try {
      const eventsFile = eventFile(from)
      if (existsSync(eventsFile)) {
        await new Promise((fulfil, reject) => {
          const readStream = createReadStream(eventsFile)
            .pipe(es.split())
            .pipe(es.parse())
            .on('end', fulfil)
            .on('error', reject)

          migrators
            .reduce((stream, migrator) => stream.pipe(migrator), readStream)
            .pipe(new JsonStringify())
            .pipe(createWriteStream(eventFile(to)))
        })
      }
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  async function doNecessaryMigrations(): Promise<string> {
    const versionFile = resolve(basePath, 'state.json')
    const eventsVersionNo = parseInt(existsSync(versionFile) && JSON.parse(readFileSync(versionFile).toString()).versionNo) || 0
    const indexName = resolve(migrationsPath, 'index.' + __filename.replace(/^.*\.(\w+)$/, '$1'))
    const migrationsExist = existsSync(migrationsPath) && existsSync(indexName)

    const allMigrations = (migrationsExist ? (await import(migrationsPath)).default : []) as WritableStream[]
    const relevantMigrations = allMigrations.slice(eventsVersionNo)
    const versionNo = allMigrations.length
    if (eventsVersionNo < versionNo) {
      logger.info(`Migrating data from ${eventsVersionNo} to ${versionNo}`)
      await migrate(eventsVersionNo, versionNo, relevantMigrations)
      writeFileSync(versionFile, JSON.stringify({ versionNo }))
      logger.info('Migration successful')
    }
    return resolve(basePath, `events-${versionNo}.json`)
  }

  function dispatch(event: Event) {
    try {
      (listeners[(event as { type: string }).type] || []).forEach(listener => listener(event))
    } catch (error) {
      logger.error(error)
      logger.debug(error.stack)
    }
  }

  if (!existsSync(basePath)) {
    mkdirSync(basePath)
  }
  const migrationsCompleted = doNecessaryMigrations()
    .then(eventsFileName => {
      const changeStream = createWriteStream(eventsFileName, { flags: 'a' })
      changeStream.on('error', logger.error)
  
      return { eventsFileName, changeStream }
    })

  return {
    dispatch,

    async replay(): Promise<void> {
      try {
        const eventsInfo = await migrationsCompleted
        const stream = createReadStream(eventsInfo.eventsFileName)
          .pipe(es.split())
          .pipe(es.parse())
          .pipe(es.mapSync(dispatch))

        await new Promise((resolve, reject) => {
          stream.on('end', resolve)
          stream.on('error', reject)
        })
      } catch (error) {
        logger.error(error)
      }
    },

    on(type: EventType, func: Listener): Store {
      listeners[type.name] = listeners[type.name] || []
      listeners[type.name].push(func)
      return this
    },

    async emit(event: Record<string, unknown>): Promise<void> {
      try {
        const info = await migrationsCompleted
        const completeEvent = { ts: new Date(), ...event }
        info.changeStream.write(JSON.stringify(completeEvent) + '\n')
        dispatch(completeEvent)
      } catch (error) {
        logger.error(error)
      }
    },

    async end(): Promise<void> {
      const info = await migrationsCompleted
      info.changeStream.end()
    },
  }
}
