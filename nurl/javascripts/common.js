"use strict";

var padStart;

if (typeof module != 'undefined') {
  // Running under node.js (tests) which does not
  // have the String.padStart method.
  padStart = require('pad-start');
} else {
  padStart = function (s, length, pad) {
    return s.padStart(length, pad);
  }
}

console.log('common.js');

class Region {
  constructor(begin, length) {
    this.begin = begin;
    this.length = length;
  }

  toString () {
    return `Region(${this.begin}, ${this.length})`;
  }

  step(url, delta, pad) {
    let value = Number.parseInt(getRegionText(url, this));
    let newValue = value + delta;
    if (newValue < 0) {
      newValue = 0;
    }
    return this.newUrl(url, newValue, pad);
  }

  newUrl(url, value, pad) {
    let prefix = url.substring(0, this.begin);
    let suffix = url.substr(this.begin + this.length);
    let valueText = '' + value;
    if (pad) {
      valueText = padStart(valueText, this.length, '0');
    }
    return prefix + valueText + suffix;
  }
}


function getRegionText(url, region) {
  return url.substr(region.begin, region.length);
}

const numberRe = /\d+/

function detectRegions(url) {
  let regions = []
  let s = url;
  let absIndex = 0;
  while (true) {
    let m = s.match(numberRe);
    if (!m) {
      return regions;
    }
    regions.push(new Region(absIndex + m.index, m[0].length));
    absIndex += m.index + m[0].length;
    s = s.substr(m.index + m[0].length);
  }
  return regions;
}

function rangeName(url, region) {
  let t = url.substr(0, region.begin - 1);
  t = t.replace('://', '-');
  return t.replace(/\/+/g, '_');
}

export default {
  detectRegions: detectRegions,
  getRegionText: getRegionText,
  rangeName: rangeName
}
