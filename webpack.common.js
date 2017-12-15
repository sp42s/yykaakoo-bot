const webpack = require('webpack')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: './src/js/yykaakoo.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'yykaakoo.bundle.js'
  },
  stats: {
    colors: true
  },
  plugins: [
    // new CleanWebpackPlugin(['dist']),
  ]
}