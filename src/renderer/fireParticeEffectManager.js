import ParticleEffectManager from './particleEffectManager';
import Utility from './utility';
class FireParticleEffectManager extends ParticleEffectManager {
  constructor(ctx) {
    super(ctx);
  }
  spawnParticles() {
    let len = this.particles.length;
    if (len < 100) {
      this.particles.push(this.createParticle(this.cursorPos.left + 10, this.cursorPos.top - 10));
    }
  }
  createParticle(x, y) {
    let p = {
      xPos: x,
      yPos: y,
      xSpeed: -1.5 + Math.random() * 3,
      ySpeed: 1 + Math.random() * 5.5,
      rad: 1 + Math.floor(Math.random() * 20),
      life: 50,
      color: Utility.randColor(),
      opacity: 1,
      dead: false
    }
    return p;
  }
  drawParticles() {
    let len = this.particles.length;
    if (len === 0) {
      return;
    }
    let cnt = 0;
    if (len < 100) {
      this.particles.push(this.createParticle(this.cursorPos.left + 10, this.cursorPos.top - 10));
    }
    for (let i = 0; i < this.particles.length; i++) {
      let particle = this.particles[i];
      if (!particle || particle.yPos < 0 || particle.life === 0 || particle.opacity === 0 || particle.rad < 1) {
        particle.dead = true;
        cnt++;
        continue;
      }
      this.drawParticle(particle);
      if (!particle.dead) {
        particle.yPos -= particle.ySpeed;
        particle.xPos += particle.xSpeed;
        particle.life = particle.life - 1;
        particle.opacity -= 0.05;
        //particle.opacity *= 0.96;
        particle.rad = particle.rad - 1;
      }
      // else {
      //   this.particles[i] = this.createParticle(particle.xPos, particle.yPos);
      // }
    }
    if (cnt === len) {
      this.particles = [];
    }
  }
  drawParticle(particle) {
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.xPos, particle.yPos, particle.rad, 0, Math.PI * 2);
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fill(); //
    this.ctx.closePath();
  }
}
export default FireParticleEffectManager;