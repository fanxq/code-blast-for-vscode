<template>
  <main class="page">
    <ul class="content">
      <li>
        <span>Enable extension</span>
        <SwitchButton v-model="isEnableExtension"/>
      </li>
      <li :class="{disabled: !isEnableExtension}">
        <span>Enable shake animation</span>
        <SwitchButton v-model="isEnableShake" :disabled="!isEnableExtension"/>
      </li>
      <li 
        :class="{disabled: !isEnableExtension}"
      >
        <div class="row">
          <div class="row">
            <span class="option-item">
              <span class="title">Pick an effect</span>
              <select v-model="selectedEffect" :disabled="!isEnableExtension">
                <option v-for="(option, index) in effectList" :key="index">
                  {{option}}
                </option>
              </select>
            </span>
            <span class="option-item" v-show="!!~effectsWithColorSetting.indexOf(selectedEffect)">
              <span class="title">Pick a color</span>
              <span class="color-picker-switch" :style="{backgroundColor: typeof selectedColor === 'object'? selectedColor.hex : selectedColor}" @click="toggleColorPicker">
                <chrome-picker class="color-picker" v-show="isShowPicker" v-model="selectedColor"></chrome-picker>
              </span>
            </span>
          </div>
          <div class="row option-item" v-show="selectedEffect === 'text'">
            <span class="title">Input some text</span>
            <input class="text-input" type="text" :disabled="!isEnableExtension">
          </div>
          <div class="editor-container">
            <textarea :disabled="!isEnableExtension" id="editor" cols="30" rows="10" placeholder="write something to check the effect what you seleted"></textarea>
          </div>
        </div>
      </li>
    </ul>
    <div>
      <button class="btn center" @click="saveSettings">save</button>
    </div>
  </main>
</template>

<script>
import SwitchButton from './components/SwitchButton';
import { Chrome } from 'vue-color';
import TextareaInputObserver from './textareaInputObserver';
let textareaInputObserver;
window.config = {
  particleShape: 'dot',
  shake: false,
  particleColor: [0, 0, 0]
};
const vscode = acquireVsCodeApi();
export default {
  components:{
    SwitchButton,
    'chrome-picker': Chrome
  },
  data() {
    return {
      isEnableExtension: false,
      isEnableShake: false,
      selectedEffect: 'dot',
      effectList: ["dot", "rectangle", "star", "heart", "text", "pac-man", "fire"],
      effectsWithColorSetting: ['dot', 'rectangle', 'star', 'heart', 'text'],
      selectedColor: '#000000',
      isShowPicker: false,
    }
  },
  watch: {
    selectedColor(val) {
      console.log('selectedColor', val);
      window.config.particleColor = this.hexToRgb(val.hex);
      if (textareaInputObserver) {
        textareaInputObserver.setParticlesColor();
      }
    },
    selectedEffect(val) {
      window.config.particleShape = val;
      if (textareaInputObserver) {
        textareaInputObserver.resetParticleManager(val);
        textareaInputObserver.setParticlesColor();
      }
    },
    isEnableShake(val) {
      window.config.shake = val;
    }
  },
  mounted() {
    const editor = document.querySelector('#editor');
    textareaInputObserver = new TextareaInputObserver(editor, editor.parentNode);
    textareaInputObserver.isActive = true;
    textareaInputObserver.loop();
    textareaInputObserver.observe();
    
    vscode.postMessage({
      command: 'getConfig'
    });
    window.addEventListener('message', (event) => {
      const config = event.data;
      if (config) {
        this.isEnableExtension = config.enabled;
        this.isEnableShake = (config.shake && config.shake.enabled) || false;
        this.selectedColor = (config.particles && config.particles.color && this.rgbToHex(config.particles.color)) || '#000000';
        this.selectedEffect = (config.particles && config.particles.shape) || 'dot';
      }
    })
  },
  methods: {
    toggleColorPicker() {
      if (!this.isEnableExtension) {
        return;
      }
      this.isShowPicker = !this.isShowPicker;
    },
    hexToRgb(hexStr) {
      let rgb = [0, 0, 0];
      if (hexStr) {
        hexStr = hexStr.slice(1);
        rgb = [];
        for (let i = 0; i < hexStr.length; i += 2) {
          rgb.push(parseInt(hexStr.slice(i, i+2), 16));
        }
      }
      return rgb;
    },
    rgbToHex(rgbStr) {
      let hex = '#000000';
      try {
        const startPos = rgbStr.indexOf('(');
        const endPos = rgbStr.indexOf(')');
        let rgbValue = rgbStr.slice(startPos + 1, endPos);
        rgbValue = rgbValue.split(',');
        let hexArray = [];
        rgbValue.forEach(x => {
          let hexStr = Number(x).toString(16);
          hexArray.push(hexStr.length === 1? `0${hexStr}` : hexStr);
        });
        hex = `#${hexArray.join('')}`;
      } catch {
      }
      return hex;
    },
    getSelectedColor() {
      let colorValue = this.hexToRgb(typeof(this.selectedColor) === 'string'? this.selectedColor : this.selectedColor.hex);
      return `rgb(${colorValue.toString()})`;
    },
    saveSettings() {
      vscode.postMessage({
        command: 'setConfig',
        config: {
          enabled: this.isEnableExtension,
          'shake.enabled': this.isEnableShake,
          'particles.color': this.getSelectedColor(),
          'particles.shape': this.selectedEffect
        }
      });
    }
  },
  destroyed() {
    if (textareaInputObserver) {
      textareaInputObserver.disconnect();
    }
  }
}
</script>

<style lang="scss">
  @import '../../../code-blast-for-vscode/shakeEffect.css';
  $btnColor: #41b883;
  .page {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    .content {
      width: 90%;
      margin: 0 auto;
      list-style: none;
      li {
        display: flex;
        min-height: 60px;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ccc;
        &:last-child{
          border: none;
        }
        &.disabled {
          opacity: 0.35;
        }
      }
      select {
        width: 120px;
        height: 30px;
        border-radius: 5px;
        border-width: 2px;
        &:focus {
          outline: none;
        }
      }
      .row {
        width: 100%;
        .option-item {
          height: 40px;
          display: inline-flex;
          align-items: center;
          margin-right: 30px;
          .title {
            display: inline-block;
            margin-right: 10px;
          }
          .color-picker-switch {
            display:inline-block;
            width:20px;
            height:20px;
            border: 2px solid #ccc;
            border-radius: 2px;
            position: relative;
            .color-picker {
              position: absolute;
              left: 0;
              top: 100%;
              z-index: 99999;
            }
          }
          .text-input {
            flex: 1;
            border: 2px solid #ccc;
            padding: 2px 4px;
            border-radius: 3px;
            height: 24px;
            &:focus {
              outline: none;
            }
          }
        }
      }
      
      .editor-container{
        width: 100%;
        position: relative;
        margin-top: 10px;
        textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 5px;
          border: 2px solid #ccc;
          border-radius: 4px;
          resize: none;
          &:focus{
            outline: none;
          }
        }
      }
    }
    .btn {
      outline: none;
      height: 30px;
      border-radius: 5px;
      appearance: none;
      background-color: transparent;
      border: 2px solid $btnColor;
      padding: 0 10px;
      color: $btnColor;
      user-select: none;
      &:focus {
        background-color: rgba($btnColor, $alpha: 0.3);
      }
      &:hover {
        background-color: $btnColor;
        border-color: $btnColor;
        color: #fff;
      }
      &.center {
        display: block;
        width: 80px;
        margin: 10px auto;
      }
    }
  }
</style>