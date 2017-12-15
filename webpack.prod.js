const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglify-es-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new UglifyJSPlugin()
    ]
});