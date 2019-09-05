const path = require('path');

module.exports = {
  entry: './src/index.js',
  //mode: 'development',
  output: {
    filename: 'codeBlast.js',
    path: path.resolve(__dirname, 'code-blast-for-vscode')
  }
};