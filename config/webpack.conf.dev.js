const webpack = require('webpack')
const path = require('path')

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: path.resolve(__dirname, '..', 'src', 'index.js'),
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
          options: {
            cacheDirectory: true,
            cacheCompression: false,
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  "plugins": [
    new webpack.HotModuleReplacementPlugin()
  ]
}
