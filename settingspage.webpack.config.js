const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/settingsPage/src/main.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    publicPath: './',
    filename: 'settingsPage.js',
    path: path.resolve(__dirname, 'settingsPage')
  },
  resolve: {
    extensions: ['.js', '.json','.vue'] 
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
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './src/settingsPage/template/index.html')
    }),
    new VueLoaderPlugin()
  ],
  devServer: {
    contentBase: path.join(__dirname, "settingsPage"),
    port: 9000
  }
};