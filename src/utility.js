let cache = null;
export default class Utility {
  constructor() {

  }
  static throttle(callback, limit) {
    var wait = false;
    return function () {
      if (!wait) {
        callback.apply(this, arguments);
        wait = true;
        setTimeout(function () {
          wait = false;
        }, limit);
      }
    }
  }

  static random(min, max) {
    if (!max) {
      max = min;
      min = 0;
    }
    return min + ~~(Math.random() * (max - min + 1))
  }

  static getAccessibleColor(rgb) {
    let [r, g, b] = rgb;
    let colors = [r / 255, g / 255, b / 255];
    let c = colors.map((col) => {
      if (col <= 0.03928) {
        return col / 12.92;
      }
      return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? [0, 0, 0] : [255, 255, 255];
  }

  static randColor() {
    //Creates random color in red hues
    var r = 100 + Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 150);
    var b = Math.floor(Math.random() * 15);

    return "rgb(" + r + "," + g + "," + b + ")";
  }

  static getDebugToolbar() {
    if (cache) {
      return cache;
    } else {
      cache = document.querySelector('.debug-toolbar');
      return cache;
    }
  }
}