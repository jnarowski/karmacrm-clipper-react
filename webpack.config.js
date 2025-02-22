const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { CheckerPlugin } = require('awesome-typescript-loader')
const ExtensionReloader = require('webpack-extension-reloader')

const sourceRootPath = path.join(__dirname, 'src')
const distRootPath = path.join(__dirname, 'dist')
const nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'
const webBrowser = process.env.WEB_BROWSER ? process.env.WEB_BROWSER : 'chrome'

const extensionReloader =
  nodeEnv === 'watch' ?
  new ExtensionReloader({
    port: 9128,
    reloadPage: true,
    entries: {
      background: 'background',
      extensionPage: ['popup', 'options'],
      contentScript: 'content',
    },
  }) :
  () => {
    this.apply = () => {}
  }

const cleanWebpackPlugin =
  nodeEnv === 'production' ?
  new CleanWebpackPlugin() :
  () => {
    this.apply = () => {}
  }

module.exports = {
  watch: nodeEnv === 'watch',
  entry: {
    background: path.join(sourceRootPath, 'ts', 'background', 'index.ts'),
    options: path.join(sourceRootPath, 'ts', 'options', 'index.tsx'),
    popup: path.join(sourceRootPath, 'ts', 'popup', 'index.tsx')
  },
  output: {
    path: distRootPath,
    filename: '[name].js',
  },
  resolve: {
    alias: {
      background: path.resolve(__dirname, 'src/ts/background'),
      popup: path.resolve(__dirname, 'src/ts/popup'),
      services: path.resolve(__dirname, 'src/ts/services'),
      utils: path.resolve(__dirname, 'src/ts/utils'),
    },
    extensions: ['.js', '.ts', '.tsx', '.json'],
  },
  module: {
    rules: [{
      test: /\.(js|ts|tsx)?$/,
      loader: 'awesome-typescript-loader',
      exclude: /node_modules/,
    }, { test: /\.css$/, use: ['style-loader', 'css-loader'] }],
  },
  plugins: [
    new CheckerPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(sourceRootPath, 'html', 'options.html'),
      inject: 'body',
      filename: 'options.html',
      title: 'Web Extension Starter - Options Page',
      chunks: ['options'],
    }),
    new HtmlWebpackPlugin({
      template: path.join(sourceRootPath, 'html', 'popup.html'),
      inject: 'body',
      filename: 'popup.html',
      title: 'Web Extension Starter - Popup Page',
      chunks: ['popup'],
    }),
    new CopyWebpackPlugin([{
        from: path.join(sourceRootPath, 'assets'),
        to: path.join(distRootPath, 'assets'),
        test: /\.(jpg|jpeg|png|gif|svg)?$/,
      },
      {
        from: path.join(sourceRootPath, 'manifest.json'),
        to: path.join(distRootPath, 'manifest.json'),
        toType: 'file',
      },
    ]),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(nodeEnv),
      WEB_BROWSER: JSON.stringify(webBrowser),
    }),
    extensionReloader,
    cleanWebpackPlugin,
  ],
}
