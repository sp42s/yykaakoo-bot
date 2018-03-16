const webpack = require('webpack')
const path = require('path')

module.exports = {
  node: {
    fs: "empty",
    uws: "empty"
  },
  performance: false,
  target: 'node'
};