const webpack = require('webpack')
const path = require('path')
const babelConfig = require(path.resolve(__dirname, '..', 'babel.config'))

const mode = process.env.NODE_ENV || 'development'
const plugins = []
const index = []
if (mode === 'development') {
  plugins.push(new webpack.HotModuleReplacementPlugin())
  index.push('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000')
}
index.push(path.resolve(__dirname, '..', 'src', 'index.js'))

module.exports = {
  mode,
  entry: {index, },
  output: {
    path: path.resolve(__dirname, '..', 'build'),
    filename: 'bundle.js'
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
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.m?js$/,
        exclude: [/node_modules/, /build/],
        use: {
          loader: require.resolve('babel-loader'),
          options: babelConfig
        }
      }
    ]
  },
  plugins,
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}
