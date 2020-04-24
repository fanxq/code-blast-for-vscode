import Vue from 'vue';
import App from './App.vue';
const vm = new Vue({
  el: '#app',
  components: {
    App,
  },
  render: h => h(App),
});