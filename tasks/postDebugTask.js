const path = require('path');
const fs = require('fs');
const argv = process.argv;
if (argv && argv.length === 3) {
    console.log('stop debug');
    const execPath = argv[2];
    const execDir = path.dirname(execPath);
    const workbenchFile = path.join(execDir, 'resources', 'app', 'out', 'vs', 'code', "electron-browser", "workbench", 'workbench.html');
    const fileContent = fs.readFileSync('./workbench.copy.html', 'utf-8');
    fs.writeFileSync(workbenchFile, fileContent, 'utf-8');
}