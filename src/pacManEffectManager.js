import ParticleEffectManager from './particleEffectManager';

class PacManEffectManager extends ParticleEffectManager {
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
export default PacManEffectManager;