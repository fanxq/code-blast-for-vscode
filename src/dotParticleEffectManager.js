import ParticleEffectManager from './particleEffectManager';
import Utility from './utility';
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
export default DotParticleEffectManager;