<template>
  <main class="page">
    <ul class="content">
      <li>
        <span>Enable extension</span>
        <SwitchButton v-model="isEnableExtension"/>
      </li>
      <li>
        <span>Enable shake animation</span>
        <SwitchButton v-model="isEnableShake"/>
      </li>
      <li>
        <div class="row">
         <div class="row">
            <span>
              <span>Pick an effect</span>
              <select v-model="selectedEffect">
                <option v-for="(option, index) in effectList" :key="index">
                  {{option}}
                </option>
              </select>
            </span>
          <span v-show="!!~effectsWithColorSetting.indexOf(selectedEffect)">
            <span>Pick a color</span>
            <span class="color-picker-switch" :style="{backgroundColor: typeof selectedColor === 'object'? selectedColor.hex : selectedColor}" @click="toggleColorPicker">
              <chrome-picker class="color-picker" v-show="isShowPicker" v-model="selectedColor"></chrome-picker>
            </span>
          </span>
         </div>
         <div class="editor-container">
           <textarea id="editor" cols="30" rows="10"></textarea>
         </div>
        </div>
      </li>
    </ul>
  </main>
</template>

<script>
import SwitchButton from './components/SwitchButton';
import { Chrome } from 'vue-color';
const CaretCoordinates = require('textarea-caret-position');
let editor;
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
    }
  },
  mounted() {
    const editor = document.querySelector('#editor');
    const coordinates = new CaretCoordinates(document.querySelector('#editor'));
    document.querySelector('#editor').addEventListener('input', function () {
      
      let result = coordinates.get(this, this.selectionEnd);
      console.log(result.top);
      console.log(result.left);
    });
  },
  methods: {
    toggleColorPicker() {
      this.isShowPicker = !this.isShowPicker;
    },
  }
}
</script>

<style lang="scss">
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
        .color-picker-switch {
          display:inline-block;
          width:26px;
          height:26px;
          position: relative;
          .color-picker {
            position: absolute;
            left: 0;
            top: 100%;
          }
        }
      }
      
      .editor-container{
        width: 100%;
        textarea {
          width: 100%;
          border: 1px solid #ccc;
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