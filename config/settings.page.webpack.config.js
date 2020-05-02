const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '../src/settingsPage/src/main.js'),
  mode: 'development',
  devtool: 'source-map',
  output: {
    publicPath: './',
    filename: 'settingsPage.js',
    path: path.resolve(__dirname, '../dist/settingsPage')
  },
  resolve: {
    extensions: ['.js', '.json', '.vue']
  },
  module: {
    rules: [
      // ... 其它规则
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader'
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, '../dist/**/*')]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/settingsPage/template/index.html')
    }),
    new VueLoaderPlugin()
  ],
};