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
        id="otherOptions"
      >
        <div class="row">
          <div class="row">
            <span class="option-item">
              <span class="title">Pick an effect</span>
              <select v-model="selectedEffect">
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
            <input class="text-input" type="text">
          </div>
          <div class="editor-container">
            <textarea id="editor" cols="30" rows="10" placeholder="write something to check the effect what you seleted"></textarea>
          </div>
        </div>
      </li>
    </ul>
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
      selectedColor: '#000',
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
    document.querySelector('#otherOptions').addEventListener('click', this.clickHandler, true);
  },
  methods: {
    toggleColorPicker() {
      this.isShowPicker = !this.isShowPicker;
    },
    hexToRgb(hexStr) {
      let rgb = [0, 0, 0];
      if (hexStr) {
        hexStr = hexStr.slice(1);
        rgb = [];
        for (let i = 0; i < 6; i += 2) {
          rgb.push(parseInt(hexStr.slice(i, i+2), 16));
        }
      }
      return rgb;
    },
    clickHandler(event) {
      if(event && !this.isEnableExtension) {
        console.log(event);
        event.pervent
        event.stopPropagation();
        return false;
      }
    }
  },
  destroyed() {
    if (textareaInputObserver) {
      textareaInputObserver.disconnect();
    }
    document.querySelector('#otherOptions').removeEventListener('click', this.clickHandler, true);
  }
}
</script>

<style lang="scss">
  @import '../../../code-blast-for-vscode/shakeEffect.css';
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
  }
</style>