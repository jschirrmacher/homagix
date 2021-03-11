/* eslint-disable @typescript-eslint/no-var-requires */

const webpack = require('webpack')
const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

const fs = require('fs')
const packageJson = fs.readFileSync('./package.json')
const version = JSON.parse(packageJson).version || 0

const mode = process.env.NODE_ENV || 'development'
const isDev = mode === 'development'
const plugins = []
const index = []
if (isDev) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
  index.push('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000')
}
index.push(path.resolve(__dirname, '..', 'frontend', 'main.ts'))
plugins.push(new VueLoaderPlugin())
plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      PACKAGE_VERSION: '"' + version + '"',
    },
  })
)

module.exports = {
  mode,
  entry: { index },
  output: {
    path: path.resolve(__dirname, '..', 'build', 'frontend'),
    filename: 'bundle.js',
    sourceMapFilename: '[name].js.map',
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.vue', '.ts'],
    alias: {
      vue$: isDev ? 'vue/dist/vue.js' : 'vue/dist/vue.runtime.min.js',
      '@': path.resolve(__dirname, '..', 'frontend'),
    },
  },
  module: {
    rules: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: 'file-loader',
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.scss$/,
        use: [
          isDev ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: isDev } },
          { loader: 'sass-loader', options: { sourceMap: isDev } },
        ],
      },
      {
        test: /\.ts$/,
        loader: { loader: 'babel-loader', options: { sourceMap: isDev } },
      },
      {
        test: /\.vue$/,
        loader: { loader: 'vue-loader', options: { sourceMap: isDev } },
      },
    ],
  },
  plugins,
}
