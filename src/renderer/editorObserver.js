import EffectManager from './effectManager';
import Utility from './utility';
class LineData {
  constructor(top, data) {
    this.top = top;
    this.data = data || "";
  }
}
class EditorObserver {
  constructor(editor, editorContainer) {
    this.cursorPos = {
      left: 0,
      top: 0
    };
    this.cursorOffsetTop = 0;
    this.shakeTime = 0;
    this.shakeTimeMax = 0;
    this.shakeIntensity = 5;
    this.lastTime = 0;
    this.editorContainer = editorContainer;
    this.w = editorContainer.clientWidth;
    this.h = editorContainer.clientHeight;
    this.effect = (config && config.particleShape) || 'dot';
    this.isActive = false;
    this.editor = editor;
    this.translateY = 0;
    this.translateX = 0;
    this.lines = [];
    this.cmNode = null;
    this.canvas = null;
    this.ctx = null;
    if (editor && editorContainer) {
      var canvas = editorContainer.querySelector('CANVAS#code-blast-canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        editorContainer.appendChild(canvas);
      }
      var ctx = canvas.getContext('2d');
      canvas.id = 'code-blast-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.zIndex = 9999;
      canvas.style.pointerEvents = 'none';
      canvas.style.willChange = 'transform';
      canvas.width = editor.clientWidth;
      canvas.height = editor.clientHeight;
      this.canvas = canvas;
      this.ctx = ctx;

    }
    this.particleManager = new EffectManager(this.ctx, this.effect);
    this.setParticlesColor();
    this.isShaking = false;
    this.throttledShake = Utility.throttle(this.shake, 100).bind(this);
    this.throttledSpawnParticles = Utility.throttle(this.particleManager.spawnParticles, 100).bind(this.particleManager);
    this.observer = null;
  }

  resetParticleManager(updatedConfig) {
    this.isActive = false;
    if (config) {
      config = updatedConfig;
    } else {
      config = Object.assign(config, updatedConfig);
    }
    this.particleManager = new EffectManager(this.ctx, updatedConfig.particleShape);
    this.throttledSpawnParticles = Utility.throttle(this.particleManager.spawnParticles, 100).bind(this.particleManager);
    this.isActive = true;
  }

  shake(node, time) {
    this.cmNode = node;
    this.shakeTime = this.shakeTimeMax = time;
  }

  setParticlesColor() {
    if (config && config.particleColor) {
      this.particleManager.setColor(config.particleColor);
    } else {
      var particleColor = [0, 0, 0];
      var bgColor = getComputedStyle(this.editor).backgroundColor;
      if (bgColor) {
        var rgbStr = /^rgb\(([0-9,\s]{7,})\)/.exec(bgColor);
        if (rgbStr && rgbStr.length > 1) {
          var rgb = rgbStr[1].split(',');
          rgb = rgb.map((x) => {
            return parseInt(x);
          });
          particleColor = Utility.getAccessibleColor(rgb);
        }
      }
      this.particleManager.setColor(particleColor);
    }
  }

  loop() {
    if (!this.isActive) {
      return;
    }
    this.ctx.clearRect(0, 0, this.w, this.h);

    var current_time = new Date().getTime();
    if (!this.lastTime) this.lastTime = current_time;
    var dt = (current_time - this.lastTime) / 1000;
    this.lastTime = current_time;

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      if (!this.isShaking) {
        this.cmNode.classList.add('shake');
        this.isShaking = true;
      }
    } else {
      if (this.cmNode && this.cmNode.style) {
        if (this.isShaking) {
          this.cmNode.classList.remove('shake');
          this.isShaking = false;
        }
      }
    }
    this.particleManager.drawParticles();
    requestAnimationFrame(this.loop.bind(this));
  }

  observe(option) {
    var self = this;
    var id = self.editor.getAttribute("id");
    this.observer = new MutationObserver(function (mts) {
      mts.forEach(function (mt) {
        if (mt.type === "attributes" && mt.target.classList.contains("monaco-editor")) {
          if (id === mt.target.getAttribute('id')) {
            if (mt.attributeName === "class") {
              self.setParticlesColor();
            }
            if (self.canvas) {
              self.canvas.width = mt.target.clientWidth;
              self.canvas.height = mt.target.clientHeight;
            }
            self.w = mt.target.clientWidth;
            self.h = mt.target.clientHeight;
          }
        }
        if (mt.type === "attributes" && mt.target.classList.contains("lines-content")) {
          var top = getComputedStyle(mt.target).top;
          var left = getComputedStyle(mt.target).left;
          self.translateY = parseInt(top);
          self.translateX = parseInt(left);
          console.log(`changed by linesContent,x:${self.translateX},y:${self.translateY}`);
        }

        if (mt.type == "attributes" && (mt.target.className === "cursor " || mt.target.className === "cursor monaco-mouse-cursor-text ")) {
          if (mt.attributeName === "style") {
            if (self.translateX == 0 && self.translateY == 0) {
              //var linesContent = document.querySelector(".editor-instance .lines-content");
              var linesContent = self.editorContainer.querySelector(".editor-instance .lines-content");
              if (linesContent) {
                var top = getComputedStyle(linesContent).top;
                var left = getComputedStyle(linesContent).left;

                self.translateY = parseInt(top);
                self.translateX = parseInt(left);
                console.log(`changed by cursor,x:${self.translateX},y:${self.translateY}`);
              }
            }
            self.cursorPos.left = self.translateX < 0 ? mt.target.offsetLeft + 67 + self.translateX : mt.target.offsetLeft + 67;
            self.cursorPos.top = self.translateY < 0 ? mt.target.offsetTop + self.translateY : mt.target.offsetTop;
            self.particleManager.setCursorPositon(self.cursorPos);
            self.cursorOffsetTop = mt.target.offsetTop;
            //console.log("cursor position(relative to  the editor):");
            //console.log(self.cursorPos);
          }
        }
        if (mt.type == "childList" && mt.target.classList.contains("view-lines")) {
          if (mt.addedNodes.length === 1 && mt.addedNodes[0].classList.contains("view-line")) {
            //console.log(self.lines);
            var index = -1;
            var text = mt.addedNodes[0].innerHTML;
            var lineTop = mt.addedNodes[0].offsetTop;
            var isExisted = false;
            for (var i = 0; i < self.lines.length; i++) {
              if (self.lines[i].top == lineTop) {
                isExisted = true;
                index = i;
                break;
              }
            }
            if (!isExisted) {
              var line = new LineData(lineTop, text);
              self.lines.push(line);
            } else {
              if (self.lines[index].data == "") {
                self.lines[index].data = text;
              } else {
                if (self.lines[index].data !== text) {
                  let _debugTool = Utility.getDebugToolbar();
                  let isDebuging = _debugTool ? (window.getComputedStyle(_debugTool).display === 'none' ? false : true) : false;
                  if (!isDebuging) {
                    if (config && config.shake) {
                      self.cursorOffsetTop === lineTop && self.throttledShake(mt.target, 0.3);
                    }
                    self.throttledSpawnParticles(self.editor);
                  }
                }
                self.lines[index].data = text;
              }
            }
          }
        }
      });
    });

    this.observer.observe(this.editor, option || {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default EditorObserver;