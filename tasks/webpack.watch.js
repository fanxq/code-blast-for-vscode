const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const fs = require('fs');
const path = require('path');
const codeBlastConfigFilePath= path.resolve(__dirname, '../dist/code.blast.config.js');
const settingsJsonPath = path.resolve(__dirname, '../dist/settings.json');
console.log('------watch files----');
const compiler = webpack({
  entry: {
      extension: path.resolve(__dirname, '../src/extension/index.js'),
      codeBlast: path.resolve(__dirname, '../src/renderer/index.js')
  },
  output: {
    clean: true,
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist')
  },
  plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      new CopyPlugin({
          patterns: [
              {
                  from: path.resolve(__dirname, '../package.json'),
                  to: path.resolve(__dirname, '../dist'),
                  transform(content) {
                      content = content.replace(/(code-blast)/gm, '$1-debug').replace(/(codeBlast)/gm, '$1Debug');
                      return content;
                  }
              }, {
                  from: path.resolve(__dirname, '../images/icon.png'),
                  to: path.resolve(__dirname, '../dist')
              }, {
                  from: path.resolve(__dirname, '../CHANGELOG.md'),
                  to: path.resolve(__dirname, '../dist')
              }, {
                  from: path.resolve(__dirname, '../README.md'),
                  to: path.resolve(__dirname, '../dist')
              }, {
                  from: path.resolve(__dirname, '../images'),
                  to: path.resolve(__dirname, '../dist/images')
              }, {
                  from: path.resolve(__dirname, '../src/assets/config/**/*'),
                  to: path.resolve(__dirname, '../dist')
              }, {
                  from: path.resolve(__dirname, '../src/assets/shakeEffect.css'),
                  to:  path.resolve(__dirname, '../dist')
              }
          ]
      })
  ]
});

const watching = compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
    if(!err) {
        let settings = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf-8'));
        let configFileContent = `
            window.__codeBlastConfig = {
                particleShape: '${settings.effect}',
                shake: ${settings.shake},
                particleColor: [255, 255, 255],
                updateAt: ${+new Date}
            };
        `;
        fs.writeFileSync(codeBlastConfigFilePath, configFileContent, 'utf-8');
    } else {
        console.log(err);
    }
});
