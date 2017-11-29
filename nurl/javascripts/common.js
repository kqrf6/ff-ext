"use strict";

console.log('common.js');

class Region {
  constructor(url,begin, length, value, step, zeroPad) {
    this.url = url;
    this.begin = begin;
    this.length = length;
    this.value = value;
  }

  static forUrl(url, begin, text) {
    return new Region(url, begin, text.length,
      Number.parseInt(text), 1, text.startsWith('0'));
  }

  startsWithZero() {
    return this.url.substr(this.begin).startsWith('0');
  }

  toString () {
    return `Region(${this.begin}, ${this.value})`;
  }

  step(delta, pad) {
    var newValue = this.value + delta;
    if (newValue < 0) {
      newValue = 0;
    }
    return this.newUrl(newValue, pad);
  }

  newUrl(value, pad) {
    var prefix = this.url.substring(0, this.begin);
    var suffix = this.url.substr(this.begin + this.length);
    var valueText = '' + value;
    if (pad) {
      valueText = valueText.padStart(this.length, '0');
    }
    return prefix + valueText + suffix;
  }
}

const numberRe = /\d+/

function detectRegions(url) {
  var regions = []
  var s = url;
  var absIndex = 0;
  while (true) {
    var m = s.match(numberRe);
    if (!m) {
      return regions;
    }
    regions.push(Region.forUrl(url, absIndex + m.index, m[0]));
    absIndex += m.index + m[0].length;
    s = s.substr(m.index + m[0].length);
  }
  return regions;
}

window.common = {
  detectRegions: detectRegions
}

if (typeof module != 'undefined') {
  module.exports = { detectRegions: detectRegions };
}
