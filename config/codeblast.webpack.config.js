const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, '../src/index.js'),
  //mode: 'development',
  output: {
    filename: 'codeBlast.js',
    path: path.resolve(__dirname, '../dist/code-blast-for-vscode')
  },
  plugins: [
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../extension.js'),
      to: path.resolve(__dirname, '../dist')
    }, {
      from: path.resolve(__dirname, '../code-blast-for-vscode/old/codeBlast.js'),
      to: path.resolve(__dirname, '../dist/code-blast-for-vscode/old')
    }, {
      from: path.resolve(__dirname, '../code-blast-for-vscode/config.json'),
      to: path.resolve(__dirname, '../dist/code-blast-for-vscode')
    }, {
      from: path.resolve(__dirname, '../code-blast-for-vscode/shakeEffect.css'),
      to: path.resolve(__dirname, '../dist/code-blast-for-vscode')
    }, {
      from: path.resolve(__dirname, '../package.json'),
      to: path.resolve(__dirname, '../dist')
    }])
  ]
};