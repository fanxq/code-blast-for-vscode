// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const base = path.dirname(require.main.filename);
const indexDir = path.join(base, 'vs', 'workbench', 'electron-browser', 'bootstrap');
const extensionPath = vscode.extensions.getExtension('fanxq.code-blast').extensionPath;
function showRestartWindowsInfo(info){
    vscode.window.showInformationMessage(info, { title: "Restart vscode" })
    .then(function (item) {
        if (!item) return;
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    });
}

function writeFileSync(filePath,fileContent){
    try {
        fs.writeFileSync(filePath,fileContent,'utf8');
    } catch (error) {
        vscode.window.showWarningMessage('code-blast encountered a error during running, please reopen vscode with the administrator authority');
    }
}

class CodeBlast{
    constructor(){

    }
    copyFile(src,dst){
        fs.writeFileSync(dst, fs.readFileSync(src));
    }
    install(isFirstLoad){
        let hackFiles = ['codeBlast.js','shakeEffect.css'];
        let originalIndexFileName = path.join(indexDir, 'index.html');
        let indexFileContent = fs.readFileSync(originalIndexFileName).toString('utf8');
        let isHack = fs.existsSync(path.join(indexDir,'codeBlast.js')) && indexFileContent && ~indexFileContent.indexOf('codeBlast.js');
        let config  = vscode.workspace.getConfiguration('codeBlast');
        if(isFirstLoad && !config.enabled){
            config.update("enabled",true,true);
            return;
        }
        let shakeEnabled = config.get('shake.enabled');
        let particlesColor = config.get('particles.color');
        if(config.enabled){
            if(!isHack){
                if(indexFileContent){
                    if(indexFileContent.indexOf('shakeEffect.css') === -1){
                        indexFileContent = indexFileContent.replace('</head>',`\t<link rel="stylesheet" href="shakeEffect.css"></head>`);
                    }
                    if(indexFileContent.indexOf('codeBlast.js') === -1){
                        indexFileContent = indexFileContent.replace('</html>',`\t<script src="codeBlast.js"></script></html>`);
                    }
                    // try {
                    //     fs.writeFileSync(originalIndexFileName,indexFileContent,'utf8');
                    // } catch (error) {
                    //     vscode.window.showWarningMessage('code-blast encountered a error during running, please reopen vscode with the administrator authority');
                    // }
                    writeFileSync(originalIndexFileName, indexFileContent);
                }
                hackFiles.forEach((filename)=>{
                    let srcFile = path.join(extensionPath, `code-blast-for-vscode/${filename}`);
                    let dstFile = path.join(indexDir, filename);
                    this.copyFile(srcFile,dstFile);
                });
               
            } 

            var configuration = 'var config = {}; ';
            if(shakeEnabled){
                configuration += 'config.shake = true; ';
            }
            if(particlesColor){
                var rgbStr = /rgb\s*\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)\)/.exec(particlesColor);
                if(rgbStr && rgbStr.length > 1){
                    var rgb = rgbStr[1].split(',');
                    rgb = rgb.map((x)=>{return parseInt(x);});
                    configuration += `config.particleColor = [${rgb}]; `;
                }
            }
            let hackFile = path.join(extensionPath, 'code-blast-for-vscode/codeBlast.js');
            let dstFile = path.join(indexDir,'codeBlast.js');
            let fileContent =  fs.readFileSync(hackFile).toString('utf8');
            fileContent = configuration + fileContent;
            //fs.writeFileSync(dstFile,fileContent,'utf8');
            writeFileSync(dstFile, fileContent);
            if(!isHack){
                showRestartWindowsInfo("code-blast is enabled, please restart vscode!");
            }else{
                showRestartWindowsInfo("configruation of code-blast is changed, please restart vscode!");
            }
        }else{
            if(isHack){
                indexFileContent = indexFileContent.replace('\t<link rel="stylesheet" href="shakeEffect.css"></head>','</head>');
                indexFileContent = indexFileContent.replace('\t<script src="codeBlast.js"></script></html>','</html>');
                // try {
                //     fs.writeFileSync(originalIndexFileName,indexFileContent,'utf8');
                // } catch (error) {
                //     vscode.window.showWarningMessage('code-blast encountered a error during running, please reopen vscode with the administrator authority');
                // }
                writeFileSync(originalIndexFileName, indexFileContent);
                hackFiles.forEach((filename)=>{
                    let hackFile = path.join(indexDir, filename);
                    if(fs.existsSync(hackFile)){
                        fs.unlinkSync(hackFile);
                    }
                });
                showRestartWindowsInfo("code-blast is disabled, please restart vscode!");
            }
        }
    }
    initialize(){
        let firstload = this.checkFirstload();
        let isHack = fs.existsSync(path.join(indexDir,'codeBlast.js'));
        if (firstload || !isHack) {
            this.install(firstload);
        }
    }
    checkFirstload(){
        const configPath = path.join(extensionPath, 'code-blast-for-vscode/config.json');
        let info = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        if (info.firstload) {
            info.firstload = false;
            fs.writeFileSync(configPath, JSON.stringify(info, null, '    '), 'utf-8');
            return true;
        }

        return false;
    }
    watch(){
        this.initialize();
        return vscode.workspace.onDidChangeConfiguration(() => this.install(false));
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-blast" is now active!');
  
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     vscode.window.showInformationMessage('Hello World!');
    // });

    //context.subscriptions.push(disposable);
    let codeblast = new CodeBlast();
    context.subscriptions.push(codeblast.watch());
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;