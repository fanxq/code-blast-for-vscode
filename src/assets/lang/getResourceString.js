import * as vscode from 'vscode';
import zh_CN_resource from './zh_CN';
import en_resource from './en';
const lang = vscode.env.language;
const resource = {
    'zh_CN': zh_CN_resource,
    'en': en_resource
};
let curResource = resource['en'];
if (lang.toLocaleLowerCase().includes('zh')) {
    curResource = resource['zh_CN'];
}
export default function getResourceString(key) {
    let result = lang.toLocaleLowerCase().includes('zh') ? `没有在资源文件中找到键值 ${key} 对应的资源` : `can not find key(${key}) in resource`; 
    if (key in curResource) {
        result = curResource[key];
    }
    return result;
}
