import ParticleEffectManager from './particleEffectManager';
import Utility from './utility';
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
export default RectParticleEffectManager;