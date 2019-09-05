import Utility from './utility';
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
export default ParticleEffectManager;