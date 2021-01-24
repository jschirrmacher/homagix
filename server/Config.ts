import path from 'path'

type Config = { nodeEnv: string, baseDir: string, dataDir: string, migrationsPath: string, PORT: number }

export default function({ logger } = { logger: console} as { logger: Console }): Config {
  const baseDir = process.env.BASEDIR || process.cwd()
  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    baseDir,
    dataDir: path.resolve(baseDir ,'data'),
    migrationsPath: path.resolve(__dirname, 'migrations'),
    PORT: parseInt(process.env.PORT || '8200'),
  }

  logger.info(config)
  return config
}
