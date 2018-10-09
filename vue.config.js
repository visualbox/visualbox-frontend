/* eslint-disable */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

module.exports = {
  runtimeCompiler: true,
  baseUrl: '/',
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin()
    ]
  }
}
