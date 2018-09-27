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
        if (!max) { max = min; min = 0; }
        return min + ~~(Math.random() * (max - min + 1))
    }

    static getAccessibleColor(rgb) {
        let [ r, g, b ] = rgb;
        let colors = [r / 255, g / 255, b / 255];
        let c = colors.map((col) => {
            if (col <= 0.03928) {
                return col / 12.92;
            }
            return Math.pow((col + 0.055) / 1.055, 2.4);
        });
        let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
        return (L > 0.179)
            ? [ 0, 0, 0 ]
            : [ 255, 255, 255 ];
    }
}

class LineData {
    constructor(top, data) {
        this.top = top;
        this.data = data || "";
    }
}

class Particle {
    constructor(ctx,effect) {
        this.ctx = ctx;
        this.effect = effect;
        this.particles = [];
        this.particlePointer = 0;
        this.MAX_PARTICLES = 500;
        this.PARTICLE_NUM_RANGE = { min: 5, max: 10 };
        this.PARTICLE_GRAVITY = 0.08;
        this.PARTICLE_ALPHA_FADEOUT = 0.96;
        this.PARTICLE_VELOCITY_RANGE = {
            x: [-1, 1],
            y: [-3.5, -1.5]
        };
        this.cursorPos = { left: 0, top: 0 };
        this.color = [0, 0, 0];
    }

    spawnParticles(cm, type) {
        var numParticles = Utility.random(this.PARTICLE_NUM_RANGE.min, this.PARTICLE_NUM_RANGE.max);
        for (var i = numParticles; i--;) {
            this.particles[this.particlePointer] = this.createParticle(this.cursorPos.left + 10, this.cursorPos.top, this.color);
            this.particlePointer = (this.particlePointer + 1) % this.MAX_PARTICLES;
        }
    }

    createParticle(x, y, color) {
        var p = {
            x: x,
            y: y + 10,
            alpha: 1,
            color: color
        };
        if (this.effect === 1) {
            p.size = Utility.random(2, 4);
            p.vx = this.PARTICLE_VELOCITY_RANGE.x[0] + Math.random() *
                    (this.PARTICLE_VELOCITY_RANGE.x[1] - this.PARTICLE_VELOCITY_RANGE.x[0]);
            p.vy = this.PARTICLE_VELOCITY_RANGE.y[0] + Math.random() *
                    (this.PARTICLE_VELOCITY_RANGE.y[1] - this.PARTICLE_VELOCITY_RANGE.y[0]);
        } else if (this.effect === 2) {
            p.size = Utility.random(2, 8);
            p.drag = 0.92;
            p.vx = Utility.random(-3, 3);
            p.vy = Utility.random(-3, 3);
            p.wander = 0.15;
            p.theta = Utility.random(0, 360) * Math.PI / 180;
        }
        return p;
    }

    drawParticles() {
        var particle;
        for (var i = this.particles.length; i--;) {
            particle = this.particles[i];
            if (!particle || particle.alpha < 0.01 || particle.size <= 0.5) { continue; }

            if (this.effect === 1) { this.effect1(particle); }
            else if (this.effect === 2) { this.effect2(particle); }
        }
    }

    setCursorPositon(value) {
        this.cursorPos = value;
    }

    effect1(particle) {
        particle.vy += this.PARTICLE_GRAVITY;
        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.alpha *= this.PARTICLE_ALPHA_FADEOUT;

        this.ctx.fillStyle = 'rgba(' + particle.color[0] + ',' + particle.color[1] + ',' + particle.color[2] + ',' + particle.alpha + ')';
        this.ctx.fillRect(Math.round(particle.x - 1), Math.round(particle.y - 1), particle.size, particle.size);
    }

    // Effect based on Soulwire's demo: http://codepen.io/soulwire/pen/foktm
    effect2(particle) {
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
class EditorObserver {
    constructor(editor, editorContainer) {
        //this.cursorCoords = { left: 0, top: 0 };
        this.cursorPos = { left: 0, top: 0 };
        this.shakeTime = 0;
        this.shakeTimeMax = 0;
        this.shakeIntensity = 5;
        this.lastTime = 0;
		this.w = editorContainer.clientWidth;
        this.h = editorContainer.clientHeight;
        this.effect = 2;
        this.isActive = false;
        this.editor = editor;
        this.translateY = 0;
        this.translateX = 0;
        this.lines = [];
        this.cmNode = null;
        this.canvas = null;
        this.ctx = null;       
        if (editor && editorContainer) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.id = 'code-blast-canvas-' + new Date().getTime();
            canvas.style.position = 'absolute';
            canvas.style.top = 0;
            canvas.style.left = 0;
            canvas.style.zIndex = 1;
            canvas.style.pointerEvents = 'none';
            canvas.style.willChange = 'transform';
            canvas.width = editor.clientWidth;
            canvas.height = editor.clientHeight;
            this.canvas = canvas;
            this.ctx = ctx;
            editorContainer.appendChild(this.canvas);
        }
        this.particleService = new Particle(this.ctx, this.effect);
        this.setParticlesColor();
        this.isShaking = false;
        this.throttledShake = Utility.throttle(this.shake, 100).bind(this);
        this.throttledSpawnParticles = Utility.throttle(this.particleService.spawnParticles, 100).bind(this.particleService);
        this.observer = null;
    }

    shake(editor, time) {
        this.cmNode = this.editor;
        this.shakeTime = this.shakeTimeMax = time;
    }

    setParticlesColor(){
        if(config && config.particleColor){
            this.particleService.color = config.particleColor;
        }else{
            var particleColor = [0,0,0];
            var bgColor = getComputedStyle(this.editor).backgroundColor;
            if(bgColor){
                var rgbStr = /^rgb\(([0-9,\s]{7,})\)/.exec(bgColor);
                if(rgbStr && rgbStr.length > 1){
                    var rgb = rgbStr[1].split(',');
                    rgb = rgb.map((x)=>{return parseInt(x);});
                    particleColor = Utility.getAccessibleColor(rgb);
                    this.particleService.color = particleColor;
                }
            }
        }
    }

    loop() {
        if (!this.isActive) { return; }
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
        this.particleService.drawParticles();
        requestAnimationFrame(this.loop.bind(this));
    }

    observe(option) {
        var self = this;
        var id = self.editor.getAttribute("id");
        this.observer = new MutationObserver(function (mts) {
            mts.forEach(function (mt) {
                if (mt.type === "attributes" && mt.target.classList.contains("monaco-editor")) {
                    if(id === mt.target.getAttribute('id')){
                        if(mt.attributeName === "class"){
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
                        self.particleService.setCursorPositon(self.cursorPos);
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
                                    if(config && config.shake){
                                        self.throttledShake(self.editor, 0.3);
                                    }
                                    self.throttledSpawnParticles(self.editor);
                                }
                                self.lines[index].data = text;
                            }
                        }
                    }
                }
            });
        });
        
        this.observer.observe(this.editor, option || { childList: true, attributes: true, characterData: true, subtree: true });
    }

    disconnect(){
        if(this.observer){
            this.observer.disconnect();
        }
    }
}

var observerMap= new Map();
let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.target.classList.contains("editor-instance") && mutation.target.getAttribute("id") === "workbench.editors.files.textFileEditor") {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
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
            if(mutation.removedNodes && mutation.removedNodes.length > 0){
                var monaco_editor = mutation.removedNodes[0];
                if (monaco_editor.classList.contains('monaco-editor')) {
                    var id = monaco_editor.getAttribute("id");
                    var editorObserver = observerMap.get(id);
                    if(editorObserver){
                        editorObserver.disconnect();
                        editorObserver = null;
                        observerMap.delete(id);
                    }
                }
            }
        }
    })
});

observer.observe(document.body, { childList: true, subtree: true });