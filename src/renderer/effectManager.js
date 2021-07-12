import RectParticleEffectManager from './rectParticleEffectManager';
import DotParticleEffectManager from './dotParticleEffectManager';
import TextEffectManager from './textEffectManager';
import StarParticleEffectManager from './starParticleEffectManager';
import HeartParticleEffectManager from './heartParticleEffectManager';
import PacManEffectManager from './pacManEffectManager';
import FireParticleEffectManager from './fireParticeEffectManager';

class EffectManager {
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
        this.particleEffectManager = new TextEffectManager(ctx);
        break;
      case 'heart':
        this.particleEffectManager = new HeartParticleEffectManager(ctx);
        break;
      case 'pac-man':
        this.particleEffectManager = new PacManEffectManager(ctx);
        break;
      case 'fire':
        this.particleEffectManager = new FireParticleEffectManager(ctx);
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

export default EffectManager;