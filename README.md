# CODE-BLAST

> Particles blasts while typing in vscode with this extension(base on [code-blast-codemirror](https://github.com/chinchang/code-blast-codemirror)).
>
> 本插件能让你在vscode敲代码时出现爆破粒子的效果
>
> Github:[https://github.com/fanxq/code-blast-for-vscode](https://github.com/fanxq/code-blast-for-vscode) 

## Features

![](./images/feature1.gif)
### Particles effects
![](./images/effect1.gif)
![](./images/effect2.gif)
![](./images/effect3.gif)
![](./images/effect4.gif)
![](./images/effect5.gif)
![](./images/pac-man.gif)

## New feature in v0.0.9 - A Settings Page for code-blast
#### How to use the settings page
  1. press "ctrl+shift+p" to open the Command Palette
  2. type 'CodeBlast' in the textbox of the Command Palette, and then the command "CodeBlast.showSettingsPage" will show up in the Command Palette
  3. click the command to invoke it and then the Settings Page will show in the VSCode. in the Settings Page, you can see what will the settings you selected look like when you typing in the "Playground". click the "save" button to save the settings, then there will be a notification to ask for reloading the VSCode show up when the settings updated. after reloading the VSCode, the settings will apply to the editor.
  
![](./images/settingsPage.gif)




## Extension Settings

> configuration of this extension 该插件提供以下的设置
* `codeBlast.enable`: 启用/禁用插件
* `codeBlast.shake.enabled`: 启用/禁用shake效果
* `codeBlast.particles.color`: 设置粒子的颜色
* `codeBlast.particles.shape`: 设置粒子的形状
* `codeBlast.particles.texts`: 当设置粒子形状为text时，可以自定义要显示的文本

## Known Issues

> this extension will modify some vscode files,so there may be exists some issues
>
> 该插件在运行时会修改vscode的文件，因此可能会有以下问题

    1. it seems no work after installing the extension. make sure that you have the administrator authority and open vscode with the administrator authority
       插件安装后却不起作用，敲代码时没有效果,请确保你有管理员权限，并以管理员权限打开vscode

    2.if vscode complains about that it is corrupted after installing this extension,just simply click “Don't show again”
      插件安装后出现"vscode安装似乎损坏"的提示消息，选择【不再显示】即可
    
    3.set 'codeBlast.enable' to false in Settings before uninstalling the extension
      因为该插件修改了vscode的文件，直接卸载插件无法将修改的文件还原，因此卸载该插件时，请先在设置中将‘codeBlast.enable’设置为false。


**Enjoy!**