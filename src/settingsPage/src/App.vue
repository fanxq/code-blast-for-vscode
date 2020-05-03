<template>
  <main class="page">
    <h1>Settings for code-blast</h1>
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
                <div class="color-picker-container" v-show="isShowPicker" @click.stop>
                  <chrome-picker class="color-picker" v-model="selectedColor"></chrome-picker>
                  <div class="btn-group">
                    <button class="btn" @click="onColorPickerOK">OK</button>
                    <button class="btn" @click="onColorPickerCancel">CANCEL</button>
                  </div>
                </div>
              </span>
            </span>
          </div>
          <div class="row option-item" v-show="selectedEffect === 'text'">
            <span class="title">Input some text</span>
            <input class="text-input" type="text" :disabled="!isEnableExtension" v-model="customizeText" @blur="checkCustomizeText">
          </div>
          <div class="error" v-show="error">{{error}}</div>
          <h3>Playground</h3>
          <div class="editor-container">
            <textarea :disabled="!isEnableExtension" id="editor" cols="30" rows="10"
               placeholder="This is the Playground to show what will the settings you selected look like. Typing in here, Try it.">
            </textarea>
          </div>
        </div>
      </li>
    </ul>
    <div class="row">
      <button class="btn center" @click="saveSettings">SAVE</button>
    </div>
  </main>
</template>

<script>
import SwitchButton from './components/SwitchButton';
import { Chrome } from 'vue-color';
import { bind, clear} from 'size-sensor';
import TextareaInputObserver from './textareaInputObserver';
import Utility from '../../utility';
let textareaInputObserver;
window.config = {
  particleShape: 'dot',
  shake: false,
  particleColor: [0, 0, 0],
  texts: ['hello world']
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
      prevSelectedColor: '#000000',
      customizeText: '',
      isShowPicker: false,
      error: ''
    }
  },
  watch: {
    selectedColor(val) {
      console.log('selectedColor', val);
      window.config.particleColor = this.hexToRgb(typeof val ==='string'? val : val.hex);
      if (textareaInputObserver) {
        console.log(`color:${window.config.particleColor}`);
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

    bind(editor, element => {
      let style = window.getComputedStyle(element);
      if (textareaInputObserver) {
        const size = {};
        size.width = parseInt(style.width, 10);
        size.height = parseInt(style.height, 10);
        console.log(`size:(${size.width},${size.height})`);
        textareaInputObserver.updateCanvasSize(size);
      }
    });
    
    vscode.postMessage({
      command: 'getConfig'
    });
    window.addEventListener('message', (event) => {
      const config = event.data;
      console.log(config);
      if (config) {
        this.isEnableExtension = config.enabled;
        this.isEnableShake = (config.shake && config.shake.enabled) || false;
        this.selectedColor = (config.particles && config.particles.color && this.rgbToHex(config.particles.color)) 
          || this.rgbToHex(Utility.getAccessibleColor(this.hexToRgb(this.rgbToHex(window.getComputedStyle(document.body).backgroundColor))));
        console.log(this.selectedColor);
        this.selectedEffect = (config.particles && config.particles.shape) || 'dot';
        this.customizeText = (config.particles && config.particles.texts) || 'hello world';
        if (config.particles && config.particles.texts) {
          this.customizeText = config.particles.texts.toString();
          window.config.texts = config.particles.texts;
        }
      }
    })
  },
  methods: {
    toggleColorPicker() {
      if (!this.isEnableExtension) {
        return;
      }
      this.isShowPicker = !this.isShowPicker;
      if (this.isShowPicker) {
        this.prevSelectedColor = this.selectedColor;
      } 
    },
    onColorPickerOK() {
      this.toggleColorPicker();
    },
    onColorPickerCancel() {
      this.selectedColor = this.prevSelectedColor;
      this.toggleColorPicker();
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
    rgbToHex(rgbVal) {
      let hex = '#000000';
      try {
        let rgbValue;
        if (typeof rgbVal === 'string') {
          let rgbStr = rgbVal;
          const startPos = rgbStr.indexOf('(');
          const endPos = rgbStr.indexOf(')');
          rgbValue = rgbStr.slice(startPos + 1, endPos);
          rgbValue = rgbValue.split(',');
        } else {
          rgbValue = rgbVal;
        }
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
    checkCustomizeText() {
      this.error = '';
      let customizeText = this.customizeText.trim();
      if (!customizeText) {
        this.error = 'input is empty!';
        return false;
      }
      if (!(/^[^,]+.*[^,]$/.test(customizeText))) {
        this.error = 'incorrect format, each piece of text must be separated by a comma';
        return false;
      }
      window.config.texts = customizeText.split(',');
      return true;
    },
    saveSettings() {
      if (this.selectedEffect === 'text') {
        this.checkCustomizeText();
      }
      let customizeText = this.customizeText.trim();
      vscode.postMessage({
        command: 'setConfig',
        config: {
          enabled: this.isEnableExtension,
          'shake.enabled': this.isEnableShake,
          'particles.color': this.getSelectedColor(),
          'particles.shape': this.selectedEffect,
          'particles.texts': customizeText.split(',')
        }
      });
    }
  },
  destroyed() {
    if (textareaInputObserver) {
      textareaInputObserver.disconnect();
    }
    clear(document.querySelector('#editor'));
  }
}
</script>

<style lang="scss">
  @import '../../../code-blast-for-vscode/shakeEffect.css';
  $themeColor: #41b883;
  body.vscode-light {
    color: black;
    
  }

  body.vscode-dark {
    color: white;
    textarea {
      background-color: #5e5e5e;
      color: white;
      &::placeholder{
        color: #e7e7e7;
      }
    }
  }
  .page {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 40px 50px;
    max-width: 800px;
    min-width: 300px;
    margin: 0 auto;
    h1 {
      color: $themeColor;
      text-align: center;
      font-size: 42px;
    }
    .content {
      width: 90%;
      margin: 0 auto;
      list-style: none;
      padding: 0;
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
            .color-picker-container {
              position: absolute;
              left: 0;
              top: 100%;
              margin-top: 3px;
              z-index: 99999;
              border: 2px solid #ccc;
              border-radius: 3px;
              background-color: #fff;
              .color-picker {
                border: none;
                box-shadow: none;
              }
              .btn-group {
                display: flex;
                padding: 5px;
                justify-content: space-between;
                align-items: center;
              }
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
      .error {
        color: white;
        padding: 2px;
        background-color: rgb(255, 184, 184);
      }
       h3 {
        color: $themeColor;
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
      border: 2px solid $themeColor;
      padding: 0 10px;
      color: $themeColor;
      user-select: none;
      &:focus {
        background-color: rgba($themeColor, $alpha: 0.3);
      }
      &:hover {
        background-color: $themeColor;
        border-color: $themeColor;
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