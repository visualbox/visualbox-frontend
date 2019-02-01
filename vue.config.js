/* eslint-disable */
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
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
      new VuetifyLoaderPlugin(),
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
  }
}
