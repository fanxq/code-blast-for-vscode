(function () {
    class Utility {
        constructor() {

        }
        static throttle(callback, limit) {
            var wait = false;
            return function () {
                if (!wait) {
                    callback.apply(this, arguments);
                    wait = true;
                    setTimeout(function () {
                        wait = false;
                    }, limit);
                }
            }
        }

        static random(min, max) {
            if (!max) {
                max = min;
                min = 0;
            }
            return min + ~~(Math.random() * (max - min + 1))
        }

        static getAccessibleColor(rgb) {
            let [r, g, b] = rgb;
            let colors = [r / 255, g / 255, b / 255];
            let c = colors.map((col) => {
                if (col <= 0.03928) {
                    return col / 12.92;
                }
                return Math.pow((col + 0.055) / 1.055, 2.4);
            });
            let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
            return (L > 0.179) ? [0, 0, 0] : [255, 255, 255];
        }
    }

    class LineData {
        constructor(top, data) {
            this.top = top;
            this.data = data || "";
        }
    }

    class ParticleEffectManager {
        constructor(ctx) {
            this.ctx = ctx;
            this.particles = [];
            this.particlePointer = 0;
            this.MAX_PARTICLES = 500;
            this.PARTICLE_NUM_RANGE = {
                min: 5,
                max: 10
            };
            this.PARTICLE_GRAVITY = 0.08;
            this.PARTICLE_ALPHA_FADEOUT = 0.96;
            this.PARTICLE_VELOCITY_RANGE = {
                x: [-1, 1],
                y: [-3.5, -1.5]
            };
            this.cursorPos = {
                left: 0,
                top: 0
            };
            this.color = [0, 0, 0];
        }

        setCursorPositon(value) {
            this.cursorPos = value;
        }

        setColor(value) {
            this.color = value;
        }

        spawnParticles() {
            var numParticles = Utility.random(this.PARTICLE_NUM_RANGE.min, this.PARTICLE_NUM_RANGE.max);
            for (var i = numParticles; i--;) {
                this.particles[this.particlePointer] = this.createParticle(this.cursorPos.left + 10, this.cursorPos.top, this.color);
                this.particlePointer = (this.particlePointer + 1) % this.MAX_PARTICLES;
            }
        }

        drawParticles() {
            var particle;
            for (var i = this.particles.length; i--;) {
                particle = this.particles[i];
                if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) {
                    continue;
                }
                this.drawParticle(particle);
            }
        }

        createParticle() {}
        drawParticle(p) {}
    }

    class RectParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }

        createParticle(x, y, color) {
            var p = {
                x: x,
                y: y + 10,
                alpha: 1,
                color: color
            };
            p.size = Utility.random(2, 4);
            p.vx = this.PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
                (this.PARTICLE_VELOCITY_RANGE.x[1] - this.PARTICLE_VELOCITY_RANGE.x[0]);
            p.vy = this.PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
                (this.PARTICLE_VELOCITY_RANGE.y[1] - this.PARTICLE_VELOCITY_RANGE.y[0]);
            return p;
        }

        drawParticle(particle) {
            particle.vy += this.PARTICLE_GRAVITY;
            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;

            this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
            this.ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
        }
    }
    class DotParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }

        createParticle(x, y, color) {
            var p = {
                x: x,
                y: y + 10,
                alpha: 1,
                color: color
            };
            p.size = Utility.random(2, 8);
            p.drag = 0.92;
            p.vx = Utility.random(-3, 3);
            p.vy = Utility.random(-3, 3);
            p.wander = 0.15;
            p.theta = Utility.random(0, 360) * Math.PI / 180;
            return p;
        }

        drawParticle(particle) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= particle.drag;
            particle.vy *= particle.drag;
            particle.theta += Utility.random(-0.5, 0.5);
            particle.vx += Math.sin(particle.theta) * 0.1;
            particle.vy += Math.cos(particle.theta) * 0.1;
            particle.size *= 0.96;

            this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
            this.ctx.beginPath();
            this.ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
            this.ctx.fill();
        }
    }
    class StarParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }

        createParticle(x, y, color) {
            var p = {
                x: x,
                y: y + 10,
                alpha: 1,
                color: color
            };
            p.size = Utility.random(4, 16);
            p.vx = this.PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
                (this.PARTICLE_VELOCITY_RANGE.x[1] - this.PARTICLE_VELOCITY_RANGE.x[0]);
            p.vy = this.PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
                (this.PARTICLE_VELOCITY_RANGE.y[1] - this.PARTICLE_VELOCITY_RANGE.y[0]);
            return p;
        }

        drawParticle(particle) {
            particle.vy += this.PARTICLE_GRAVITY;
            particle.x += particle.vx;
            particle.y += particle.vy;

            particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;
            var r = particle.size / 2;
            this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
            this.ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                this.ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * r + particle.x, -Math.sin((18 + i * 72) / 180 * Math.PI) * r + particle.y);
                this.ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * r / 2.4 + particle.x, -Math.sin((54 + i * 72) / 180 * Math.PI) * r / 2.4 + particle.y);
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
    }
    class TextParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }

        spawnParticles() {
            this.particles = this.particles.filter(x => x && x.alpha > 0.01);
            this.particles.push(this.createParticle(this.cursorPos.left + 10, this.cursorPos.top, this.color));
        }

        createParticle(x, y, color) {
            var p = {
                x: x,
                y: y + 10,
                alpha: 1,
                color: color
            };
            p.vx = Utility.random(-1, 1);
            p.vy = Utility.random(-2, -1);
            p.text = (config.texts && config.texts.length > 0 && config.texts[Utility.random(0, config.texts.length - 1)]) || "hello";
            return p;
        }

        drawParticle(particle) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;

            this.ctx.font = "14px Consolas, 'Courier New', monospace";
            this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
            this.ctx.fillText(particle.text, particle.x, particle.y);
        }
    }
    class HeartParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }

        createParticle(x, y, color) {
            var p = {
                x: x,
                y: y + 10,
                alpha: 1,
                color: color
            };
            p.size = Utility.random(2, 8);
            p.drag = 0.92;
            p.vx = Utility.random(-3, 3);
            p.vy = Utility.random(-3, 3);
            p.wander = 0.15;
            p.theta = Utility.random(0, 360) * Math.PI / 180;
            return p;
        }

        drawParticle(particle) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= particle.drag;
            particle.vy *= particle.drag;
            particle.theta += Utility.random(-0.5, 0.5);
            particle.vx += Math.sin(particle.theta) * 0.1;
            particle.vy += Math.cos(particle.theta) * 0.1;
            particle.size *= 0.96;
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.scale(particle.size, particle.size);
            this.ctx.beginPath();
            this.ctx.arc(-1, 0, 1, Math.PI, 0, false);
            this.ctx.arc(1, 0, 1, Math.PI, 0, false);
            this.ctx.bezierCurveTo(1.9, 1.2, 0.6, 1.6, 0, 3.0);
            this.ctx.bezierCurveTo(-0.6, 1.6, -1.9, 1.2, -2, 0);
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    class PacManParticleEffectManager extends ParticleEffectManager {
        constructor(ctx) {
            super(ctx);
        }
        spawnParticles() {
            var step = 30;
            var dx = step;
            for (let i = 0; i < 6; i++) {
                if (i === 0) {
                    this.particles[i] = this.createParticle(this.cursorPos.left, this.cursorPos.top - 20, 16, this.color);
                } else {
                    this.particles[i] = this.createParticle(this.cursorPos.left + dx, this.cursorPos.top - 16, 4, this.color);
                    dx += step;
                }
            }
        }
        createParticle(x, y, size, color) {
            var p = {
                x,
                y,
                size,
                color,
                alpha: 1,
                type: size > 4 ? 'pac-man' : 'pills'
            };
            return p;
        }
        drawParticle(particle) {
            this.ctx.fillStyle = 'rgba(252,252,0,' + particle.alpha + ')';
            this.ctx.beginPath();
            if (particle.type === 'pills') {
                this.ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, 0, 2 * Math.PI);
                this.ctx.fill();
                particle.x -= 2;
                if (particle.x < (this.particles[0].x + 8)) {
                    this.particles.splice(this.particles.indexOf(particle), 1);
                }
                if (this.particles.length === 1) {
                    this.particles.length = 0;
                }
            } else {
                particle.angle = particle.angle || 0;
                if (particle.angle === 0) {
                    particle.dAngle = 10;
                }
                if (particle.angle === 60) {
                    particle.dAngle = -10;
                }

                let startAngle = particle.angle + particle.dAngle;
                let endAngle = 360 - startAngle;
                let base = (Math.PI / 180);
                this.ctx.arc(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, base * startAngle, base * endAngle);
                this.ctx.lineTo(Math.round(particle.x - 1), Math.round(particle.y - 1));
                this.ctx.fill();
                particle.angle += particle.dAngle;
            }
            particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;
        }
    }
    class ParticleManager {
        constructor(ctx, effect) {
            this.particleEffectManager = null;
            switch (effect) {
                case 'rectangle':
                    this.particleEffectManager = new RectParticleEffectManager(ctx);
                    break;
                case 'dot':
                    this.particleEffectManager = new DotParticleEffectManager(ctx);
                    break;
                case 'star':
                    this.particleEffectManager = new StarParticleEffectManager(ctx);
                    break;
                case 'text':
                    this.particleEffectManager = new TextParticleEffectManager(ctx);
                    break;
                case 'heart':
                    this.particleEffectManager = new HeartParticleEffectManager(ctx);
                    break;
                case 'pac-man':
                    this.particleEffectManager = new PacManParticleEffectManager(ctx);
                    break;
                default:
                    this.particleEffectManager = new RectParticleEffectManager(ctx);
                    break;

            }
        }

        spawnParticles(cm, type) {
            this.particleEffectManager.spawnParticles();
        }

        drawParticles() {
            this.particleEffectManager.drawParticles();
        }

        setCursorPositon(value) {
            this.particleEffectManager.setCursorPositon(value);
        }

        setColor(value) {
            this.particleEffectManager.setColor(value);
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
            this.particleManager = new ParticleManager(this.ctx, this.effect);
            this.setParticlesColor();
            this.isShaking = false;
            this.throttledShake = Utility.throttle(this.shake, 100).bind(this);
            this.throttledSpawnParticles = Utility.throttle(this.particleManager.spawnParticles, 100).bind(this.particleManager);
            this.observer = null;
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
                        this.particleManager.setColor(config.particleColor);
                    }
                }
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
                    }

                    if (mt.type == "attributes" && mt.target.className == "cursor ") {
                        if (mt.attributeName === "style") {
                            if (self.translateX == 0 && self.translateY == 0) {
                                var linesContent = document.querySelector(".editor-instance .lines-content");
                                if (linesContent) {
                                    var top = getComputedStyle(linesContent).top;
                                    var left = getComputedStyle(linesContent).left;

                                    self.translateY = parseInt(top);
                                    self.translateX = parseInt(left);
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

    var config = {};
    var _debugTool = null;
    var observerMap = new Map();
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.target.classList.contains("editor-instance") && mutation.target.getAttribute("id") === "workbench.editors.files.textFileEditor") {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    _debugTool = document.querySelector('.debug-toolbar');
                    var monaco_editor = mutation.addedNodes[0];
                    if (monaco_editor.classList.contains('monaco-editor')) {
                        var container = monaco_editor.parentNode;
                        if (container) {
                            container.style.position = "relative";
                            var id = new Date().getTime().toString();
                            monaco_editor.setAttribute("id", id);
                            var editorObserver = new EditorObserver(monaco_editor, container);
                            observerMap.set(id, editorObserver);
                            editorObserver.isActive = true;
                            editorObserver.loop();
                            editorObserver.observe();
                        }
                    }
                }
                if (mutation.removedNodes && mutation.removedNodes.length > 0) {
                    var monaco_editor = mutation.removedNodes[0];
                    if (monaco_editor.classList.contains('monaco-editor')) {
                        var id = monaco_editor.getAttribute("id");
                        var editorObserver = observerMap.get(id);
                        if (editorObserver) {
                            editorObserver.disconnect();
                            editorObserver = null;
                            observerMap.delete(id);
                        }
                    }
                }
            }
        })
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();