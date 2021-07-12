import * as htmlparser2 from 'htmlparser2';
import { Element, Text } from 'domhandler';
import render from 'dom-serializer';
import getResourceString from '../assets/lang/getResourceString';
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const base = path.dirname(require.main.filename);
const extensionPath = vscode.extensions.getExtension('fanxq.code-blast').extensionPath;
const vscodeIndexFile = path.join(base, "vs", "code", "electron-browser", "workbench", 'workbench.html');

function showInformationMessage(info, isNeedRestart = false) {
    isNeedRestart ?
        vscode.window.showInformationMessage(info, {
            title: getResourceString('restart')
        })
        .then(function (item) {
            if (!item) return;
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }) :
        vscode.window.showInformationMessage(info);
}

export default class CodeBlast {
    constructor() {
        this.settingsPath = path.join(extensionPath, 'settings.json');
        this.configFilePath = path.join(extensionPath, 'code.blast.config.js');
    }

    initialize() {
        let firstload = this.checkFirstLoad();
        this.install(firstload);
    }

    install(isFirstLoad) {
        try {
            const workbenchCopyPath = path.join(extensionPath, 'workbench.html');
            let isShowRestartInfo = false;
            let config = vscode.workspace.getConfiguration('codeBlast');
            let shakeEnabled = config.get('shake.enabled');
            let particlesColor = config.get('particles.color');
            let particlesShape = config.get('particles.shape');
            let particlesTexts = config.get('particles.texts');
            if (isFirstLoad) {
                if (!config.enabled) {
                    config.update('enabled', true, true);
                    return;
                }
                // copy original workbench.html
                fs.writeFileSync(workbenchCopyPath, fs.readFileSync(vscodeIndexFile));
                let indexFileContent = fs.readFileSync(vscodeIndexFile, 'utf-8');
                let doc = htmlparser2.parseDocument(indexFileContent);
                let trustTypeMeta = htmlparser2.DomUtils.findOne((elem) => elem.tagName.toLocaleLowerCase() === 'meta' && elem.attribs['content'] && elem.attribs['content'].includes('require-trusted-types-for'), doc.childNodes, true);
                if (trustTypeMeta) {
                    let content = trustTypeMeta.attribs && trustTypeMeta.attribs['content'];
                    if (!content.includes('codeBlastLoader')) {
                        trustTypeMeta.attribs['content'] = content.slice(0, content.length - 1) + ' codeBlastLoader;';
                    }
                }
                let head = htmlparser2.DomUtils.getElementsByTagName('head', doc)[0];
                htmlparser2.DomUtils.appendChild(head, new Text('\t'));
                htmlparser2.DomUtils.appendChild(head, new Element('link', {'rel': 'stylesheet', 'href': `file:///${path.join(extensionPath, 'shakeEffect.css')}`}));
                htmlparser2.DomUtils.appendChild(head, new Text('\n'));
                let root = htmlparser2.DomUtils.getElementsByTagName('html', doc)[0];
                const codeBlastFilePath = path.join(extensionPath, 'codeBlast.js');
                let codeBlastFileContent = fs.readFileSync(codeBlastFilePath, 'utf-8');
                let snippets = `
                    Object.defineProperty(window, '_code_blast_settings_path', {
                        configurable: false,
                        enumerable: false,
                        get() {
                        return 'file:///${this.configFilePath}';
                        }
                    });
                `;
                codeBlastFileContent = snippets + codeBlastFileContent;
                fs.writeFileSync(codeBlastFilePath, codeBlastFileContent, 'utf-8');
                htmlparser2.DomUtils.appendChild(root, new Text('\t'));
                htmlparser2.DomUtils.appendChild(root, new Element('script', {'src': `file:///${codeBlastFilePath}`}));
                htmlparser2.DomUtils.appendChild(root, new Text('\n'));
                fs.writeFileSync(vscodeIndexFile, render(doc, {decodeEntities: false}), 'utf-8');
                isShowRestartInfo = true;
            } else {
                if (!config.enabled) {
                    let fileContent = fs.readFileSync(workbenchCopyPath, 'utf-8');
                    fs.writeFileSync(vscodeIndexFile, fileContent, 'utf-8');
                }
            }

            this.updateSettings({
                firstload: false, 
                enable: config.enabled,
                shake: shakeEnabled,
                color: particlesColor,
                effect: particlesShape,
                customTexts: particlesTexts
            });
            isShowRestartInfo ? showInformationMessage(getResourceString('restart_info'), true) 
                : showInformationMessage(getResourceString('update_config_info'));
        } catch (error) {
            vscode.window.showErrorMessage(`${getResourceString('error_info')}${error && error.message}`);
        }
        
    }

    updateSettings(newSettings) {
        let settings = this.getSettings();
        Object.keys(newSettings).forEach(key => {
            let setting = newSettings[key];
            settings[key] = setting;
        });
        fs.writeFileSync(this.settingsPath, JSON.stringify(settings), 'utf-8');
        let fileContent = `
            window.__codeBlastConfig = {
                particleShape: '${newSettings.effect}',
                shake: ${newSettings.shake},
                particleColor: [255, 255, 255]
            };
        `;
        fs.writeFileSync(this.configFilePath, fileContent, 'utf-8');
    }

    getSettings() {
        let settings = JSON.parse(fs.readFileSync(this.settingsPath, 'utf-8'));
        return settings;
    }

    checkFirstLoad() {
        const settings = this.getSettings();
        return settings.firstload;
    }

    watch() {
        this.initialize();
        return vscode.workspace.onDidChangeConfiguration(() => {
            this.install(false);
        });
    }
}