// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const base = path.dirname(require.main.filename);
let indexDir = path.join(base, 'vs', 'workbench', 'electron-browser', 'bootstrap');
let indexFileName = "index.html";
const extensionPath = vscode.extensions.getExtension('fanxq.code-blast').extensionPath;
const configPath = path.join(extensionPath, 'code-blast-for-vscode/config.json');
let isMinorVersionNumLessThan38 = true;
let isUpdatedBySettingsPage = false;
let emitter = new EventEmitter();

emitter.addListener('updateConfigFinish', () => {
    isUpdatedBySettingsPage = false;
    showRestartWindowsInfo("configruation of code-blast is changed, please restart vscode!");
})

function showRestartWindowsInfo(info) {
    if (isUpdatedBySettingsPage) {
        return; //由设置页更新的配置，不逐个显示消息提醒，统一在 updateConfigFinish Listener 那里只做一次显示
    }
    vscode.window.showInformationMessage(info, {
            title: "Restart vscode"
        })
        .then(function (item) {
            if (!item) return;
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        });
}

function writeFileSync(filePath, fileContent) {
    try {
        fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (error) {
        vscode.window.showWarningMessage('code-blast encountered a error during running, please reopen vscode with the administrator authority');
    }
}

class CodeBlast {
    constructor() {

    }
    copyFile(src, dst) {
        fs.writeFileSync(dst, fs.readFileSync(src));
    }
    install(isFirstLoad) {
        let hackFiles = ['codeBlast.js', 'shakeEffect.css'];
        let originalIndexFileName = path.join(indexDir, indexFileName);
        let indexFileContent = fs.readFileSync(originalIndexFileName).toString('utf8');
        let isHack = fs.existsSync(path.join(indexDir, 'codeBlast.js')) && indexFileContent && ~indexFileContent.indexOf('codeBlast.js');
        let config = vscode.workspace.getConfiguration('codeBlast');
        if (isFirstLoad && !config.enabled) {
            config.update("enabled", true, true);
            return;
        }
        let shakeEnabled = config.get('shake.enabled');
        let particlesColor = config.get('particles.color');
        let particlesShape = config.get('particles.shape');
        let particlesTexts = config.get('particles.texts');
        let settings = this.getConfig();
        if (config.enabled) {
            if (!isHack) {
                if (indexFileContent) {
                    if (indexFileContent.indexOf('shakeEffect.css') === -1) {
                        indexFileContent = indexFileContent.replace('</head>', `\t<link rel="stylesheet" href="shakeEffect.css"></head>`);
                    }
                    if (indexFileContent.indexOf('codeBlast.js') === -1) {
                        indexFileContent = indexFileContent.replace('</html>', `\t<script src="codeBlast.js"></script></html>`);
                    }
                    writeFileSync(originalIndexFileName, indexFileContent);
                }
                hackFiles.forEach((filename) => {
                    let srcFile = isMinorVersionNumLessThan38 && filename === 'codeBlast.js' ?
                        path.join(extensionPath, `code-blast-for-vscode/old/${filename}`) :
                        path.join(extensionPath, `code-blast-for-vscode/${filename}`);
                    let dstFile = path.join(indexDir, filename);
                    this.copyFile(srcFile, dstFile);
                });

            }
            var isConfigChanged = false;
            if (settings && typeof (settings.shake) !== 'undefined' && settings.shake !== shakeEnabled) {
                settings.shake = shakeEnabled;
                isConfigChanged = true;
            }
            if (settings && typeof (settings.color) !== 'undefined' && settings.color !== particlesColor) {
                if (particlesColor) {
                    var rgbStr = /rgb\s*\((\s*\d+\s*,\s*\d+\s*,\s*\d+\s*)\)/.exec(particlesColor);
                    if (rgbStr && rgbStr.length > 1) {
                        var rgb = rgbStr[1].split(',');
                        rgb = rgb.map((x) => {
                            return parseInt(x);
                        });
                        settings.rgb = rgbStr[1];
                        settings.color = particlesColor;
                        isConfigChanged = true;
                    }
                }
            }
            if (settings && typeof (settings.shape) !== 'undefined' && settings.shape !== particlesShape) {
                settings.shape = particlesShape;
                isConfigChanged = true;
            }
            if (settings && typeof (settings.customTexts) !== 'undefined' && particlesTexts) {
                particlesTexts.forEach((x) => {
                    let text = x.trim();
                    if (text && !settings.customTexts.includes(text)) {
                        settings.customTexts = particlesTexts.filter(y => y.trim()).map(y => y.trim());
                        isConfigChanged = true;
                        return;
                    }
                })
            }
            if (isConfigChanged) {
                this.writeConfigToHackFile(settings);
                this.saveConfig(settings);
            }
            if (!isHack) {
                this.writeConfigToHackFile(settings);
                showRestartWindowsInfo("code-blast is enabled, please restart vscode!");
            } else {
                if (isConfigChanged) {
                    showRestartWindowsInfo("configruation of code-blast is changed, please restart vscode!");
                }
            }
        } else {
            if (isHack) {
                indexFileContent = indexFileContent.replace('\t<link rel="stylesheet" href="shakeEffect.css"></head>', '</head>');
                indexFileContent = indexFileContent.replace('\t<script src="codeBlast.js"></script></html>', '</html>');

                writeFileSync(originalIndexFileName, indexFileContent);
                hackFiles.forEach((filename) => {
                    let hackFile = path.join(indexDir, filename);
                    if (fs.existsSync(hackFile)) {
                        fs.unlinkSync(hackFile);
                    }
                });
                showRestartWindowsInfo("code-blast is disabled, please restart vscode!");
            }
        }
    }
    initialize() {
        let firstload = this.checkFirstload();
        let isHack = fs.existsSync(path.join(indexDir, 'codeBlast.js'));
        if (firstload || !isHack) {
            this.install(firstload);
        }
    }
    checkFirstload() {
        const configPath = path.join(extensionPath, 'code-blast-for-vscode/config.json');
        let info = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

        if (info.firstload) {
            info.firstload = false;
            fs.writeFileSync(configPath, JSON.stringify(info, null, '    '), 'utf-8');
            return true;
        }

        return false;
    }
    saveConfig(settings) {
        if (settings && typeof (settings.firstload) !== undefined) {
            fs.writeFileSync(configPath, JSON.stringify(settings, null, '    '), 'utf-8');
        }
    }

    writeConfigToHackFile(settings) {
        let configuration = '"use strict"; var _debugTool = null; var config = {}; ';
        configuration += `config.shake = ${settings.shake.toString()};`
        if (settings.rgb) {
            configuration += `config.particleColor = [${settings.rgb}]; `;
        }
        configuration += `config.particleShape = '${settings.shape}';`;

        configuration += `config.texts = [${settings.customTexts.map(x=>'\"' + x + '\"').toString()}];`;
        let hackFile = path.join(extensionPath, 'code-blast-for-vscode/codeBlast.js');
        let dstFile = path.join(indexDir, 'codeBlast.js');
        let fileContent = fs.readFileSync(hackFile).toString('utf8');
        fileContent = fileContent.replace("\"use strict\";", configuration);
        writeFileSync(dstFile, fileContent);
    }

    getConfig() {
        let settings = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return settings;
    }

    watch() {
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
    console.log(vscode.version);
    var versionInfos = vscode.version.split('.');
    var version = parseInt(versionInfos[1]);
    if (version > 27) {
        indexDir = path.join(base, "vs", "code", "electron-browser", "workbench");
        indexFileName = "workbench.html";
    }
    if (version >= 38) {
        isMinorVersionNumLessThan38 = false;
    }

    let currentPanel = undefined;
    let disposable = vscode.commands.registerCommand('codeBlast.showSettingsPage', function () {
        const columnToShowIn = vscode.ViewColumn.Beside;
        if (currentPanel) {
            currentPanel.reveal(columnToShowIn);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                'settingsPage',
                'settings',
                columnToShowIn, {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                }
            );
            const resourcePath = path.join(context.extensionPath, 'settingsPage', 'index.html');
            const dirPath = path.dirname(resourcePath);
            let html = fs.readFileSync(resourcePath, 'utf-8');
            html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
                return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({
                    scheme: 'vscode-resource'
                }).toString() + '"';
            });
            currentPanel.webview.html = html;

            currentPanel.webview.onDidReceiveMessage(message => {
                const codeBlastConfig = vscode.workspace.getConfiguration('codeBlast');
                switch (message.command) {
                    case 'getConfig':
                        currentPanel.webview.postMessage(JSON.parse(JSON.stringify(codeBlastConfig)));
                        break;
                    case 'setConfig':
                        if (message.config) {
                            isUpdatedBySettingsPage = true;
                            Object.keys(message.config).forEach(x => {
                                codeBlastConfig.update(x, message.config[x], true);
                            });
                            emitter.emit('updateConfigFinish');
                        }
                        break;
                    default:
                        break;

                }
            }, undefined, context.subscriptions);

            currentPanel.onDidDispose(
                () => {
                    currentPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    });

    context.subscriptions.push(disposable);
    let codeblast = new CodeBlast();
    context.subscriptions.push(codeblast.watch());
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;