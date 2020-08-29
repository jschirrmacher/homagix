import webpack from 'webpack'
import webpackConfig from '../config/webpack.conf.cjs'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'

const compiler = webpack(webpackConfig)

export function setup(app, logger) {
  app.use(devMiddleware(compiler, {logger, publicPath: webpackConfig.output.publicPath}))
  app.use(hotMiddleware(compiler, {logger, path: '/__webpack_hmr', heartbeat: 60 * 1000}))
}
