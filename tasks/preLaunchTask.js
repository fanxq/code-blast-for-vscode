const htmlparser2 = require('htmlparser2');
const { Element, Text } = require('domhandler');
const render = require('dom-serializer');
const path = require('path');
const fs = require('fs');
console.log(process.argv);
const argv = process.argv;
if (argv && argv.length === 4) {
    console.log('start debug');
    const workspaceFolder = argv[3];
    const execPath = argv[2];
    const execDir = path.dirname(execPath);
    const workbenchFile = path.join(execDir, 'resources', 'app', 'out', 'vs', 'code', "electron-browser", "workbench", 'workbench.html');
    fs.copyFileSync(workbenchFile, './workbench.copy.html');
    let fileContent = fs.readFileSync(workbenchFile, 'utf-8');
    let doc = htmlparser2.parseDocument(fileContent);
    let trustTypeMeta = htmlparser2.DomUtils.findOne((elem) => elem.tagName.toLocaleLowerCase() === 'meta' && elem.attribs['content'] && elem.attribs['content'].includes('require-trusted-types-for'), doc.childNodes, true);
    if (trustTypeMeta) {
        let content = trustTypeMeta.attribs && trustTypeMeta.attribs['content'];
        if (!content.includes('codeBlastLoader')) {
            trustTypeMeta.attribs['content'] = content.slice(0, content.length - 1) + ' codeBlastLoader;';
        }
    }
    let head = htmlparser2.DomUtils.getElementsByTagName('head', doc)[0];
    let links = htmlparser2.DomUtils.getElementsByTagName('link', head);
    let isElemExisted = false;
    if (links) {
        let linkElem = links.find(x => x.attribs &&  x.attribs.href && x.attribs.href.indexOf('shakeEffect.css') !== -1);
        if (linkElem) {
            isElemExisted = true;
            htmlparser2.DomUtils.replaceElement(
                linkElem,
                new Element('link', {
                    'rel': 'stylesheet',
                    'href': `file:///${path.join(workspaceFolder, 'dist', 'shakeEffect.css')}`
                })
            );
        }
    }
    if (!isElemExisted) {
        htmlparser2.DomUtils.appendChild(head, new Text('\t'));
        htmlparser2.DomUtils.appendChild(head, new Element('link', {
            'rel': 'stylesheet',
            'href': `file:///${path.join(workspaceFolder, 'dist', 'shakeEffect.css')}`
        }));
        htmlparser2.DomUtils.appendChild(head, new Text('\n'));
    }
    isElemExisted = false;
    let root = htmlparser2.DomUtils.getElementsByTagName('html', doc)[0];
    let scripts = htmlparser2.DomUtils.getElementsByTagName('script', root);
    if (scripts) {
        let scriptElem = scripts.find(x => x.attribs && x.attribs.src && x.attribs.src.indexOf('codeBlast.js') !== -1);
        if (scriptElem) {
            isElemExisted = true;
            htmlparser2.DomUtils.replaceElement(
                scriptElem,
                new Element('script', {
                    'src': `file:///${path.join(workspaceFolder, 'dist', 'codeBlast.js')}`
                })
            )
        }
    }
    if (!isElemExisted) {
        htmlparser2.DomUtils.appendChild(root, new Text('\t'));
        htmlparser2.DomUtils.appendChild(root, new Element('script', {
            'src': `file:///${path.join(workspaceFolder, 'dist', 'codeBlast.js')}`
        }));
        htmlparser2.DomUtils.appendChild(root, new Text('\n'));
    }
    fs.writeFileSync(workbenchFile, render(doc, {decodeEntities: false}), 'utf-8');
}
