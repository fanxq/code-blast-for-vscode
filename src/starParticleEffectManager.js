import ParticleEffectManager from './particleEffectManager';
import Utility from './utility';
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
export default StarParticleEffectManager;