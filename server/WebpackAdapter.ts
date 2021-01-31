import webpack from 'Webpack'
import webpackConfig from '../config/webpack.config.js'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import { Router } from 'express'

const compiler = webpack(webpackConfig as webpack.Configuration)

export function setup(app: Router): void {
  app.use(devMiddleware(compiler, {}))
  app.use(hotMiddleware(compiler, {}))
}
