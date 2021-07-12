import CodeBlast from './codeBlast';
import SettingsPage from './settingsPage';

function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-blast" is now active!');
    let codeblast = new CodeBlast();
    context.subscriptions.push(codeblast.watch());

    // let settingsPage = SettingsPage(context);
    // context.subscriptions.push(settingsPage);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;