import * as vscode from 'vscode';

let currentPanel = undefined;
export default (context) => {
    return vscode.commands.registerCommand('codeBlast.showSettingsPage', function () {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
    
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
            const dirname = path.dirname(resourcePath);
            let html = fs.readFileSync(resourcePath, 'utf-8');
            html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
                return $1 + vscode.Uri.file(path.resolve(dirname, $2)).with({
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
                            Object.keys(message.config).forEach(x => {
                                codeBlastConfig.update(x, message.config[x], true);
                            });
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
} 