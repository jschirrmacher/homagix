import webpack from 'Webpack'
import webpackConfig from '../config/webpack.conf.cjs'
import devMiddleware from 'webpack-dev-middleware'
import hotMiddleware from 'webpack-hot-middleware'
import { Router } from 'express'

const compiler = webpack(webpackConfig)

export function setup(app: Router): void {
  app.use(devMiddleware(compiler, {}))
  app.use(hotMiddleware(compiler, {}))
}
