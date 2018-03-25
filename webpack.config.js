const webpack = require('webpack')

module.exports = {
  node: {
    fs: "empty"
  },
  devtool: 'source-map',
  performance: false,
  target: 'node'
};