/* eslint-disable */
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')

module.exports = {
  publicPath: '/',
  configureWebpack: {
    node: {
      process: 'mock'
    },
    plugins: [
      new MonacoWebpackPlugin(),
      new BundleAnalyzerPlugin(),
      new webpack.DefinePlugin({
        'process.platform': 0 // bypass process check by Monaco
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.md$/)
      .use('raw-loader')
        .loader('raw-loader')
        .end()
    config.module
      .rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
        .loader('worker-loader')
        .end()
  }
}
