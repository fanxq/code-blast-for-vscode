import BaseObserver from '../../editorObserver';
import EffectManager from '../../effectManager';
import Utility from '../../utility';
const CaretCoordinates = require('textarea-caret-position');
class TextareaInputObserver extends BaseObserver {
  constructor(editor, editorContainer) {
    super(editor, editorContainer);
    this.caretCoordinates = new CaretCoordinates(editor);
  }

  resetParticleManager(effect) {
    this.particleManager = new EffectManager(this.ctx, effect);
    this.throttledSpawnParticles = Utility.throttle(this.particleManager.spawnParticles, 100).bind(this.particleManager);
  }

  cursorPosChanged() {
    const cursorPos = this.caretCoordinates.get(this.editor.selectionStart, this.editor.selectionEnd);
    if (cursorPos) {
      console.log(`left:${cursorPos.left}, top:${cursorPos.top}`);
      this.particleManager.setCursorPositon(cursorPos);
      if (config && config.shake) {
        this.throttledShake(this.editor, 0.3);
      }
      this.throttledSpawnParticles(this.editor);
    }
  }

  observe() {
    this.editor.addEventListener('input', this.cursorPosChanged.bind(this), false);
  }

  disconnect() {
    this.editor.removeEventListener('input', this.cursorPosChanged.bind(this), false);
  }
}
export default TextareaInputObserver;