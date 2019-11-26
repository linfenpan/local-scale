'use strict';

const pck = require('./package.json');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: `local-scale-${pck.version}.js`,
    path: __dirname + '/dist',
    library: {
      root: 'LocalScale',
      amd: 'local-scale',
      commonjs: 'local-scale'
    },
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                "@babel/plugin-transform-runtime"
              ]
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
    ]
  },
}