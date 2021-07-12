import ParticleEffectManager from './particleEffectManager';
import Utility from './utility';
class TextEffectManager extends ParticleEffectManager {
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
export default TextEffectManager;