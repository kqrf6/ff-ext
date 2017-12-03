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

function replaceRegionsInUrl(url, replacementFn) {
  let regions = detectRegions(url);
  let index = 0
  let lastRegionEnd = 0;
  let result = ''
  for (let region of regions) {
    result += url.substring(lastRegionEnd, region.begin);
    let text = getRegionText(url, region);
    result += replacementFn(index, region, text, regions.length);
    lastRegionEnd = region.begin + region.length;
    index += 1;
  }
  return result + url.substr(lastRegionEnd);
}

function getUrlRangeSpec(url, lastRangeLength) {
  return replaceRegionsInUrl(url, (index, region, text, regionCount) => {
    let endText = text;
    if (index == regionCount - 1 && lastRangeLength != null) {
      let endValue = Number.parseInt(text) + lastRangeLength;
      endText = padStart('' + endValue, text.length, '0');
    }
    return `{${text}-${endText}:1}`;
  });
}

function getRangesFromUrlRangeSpec(spec) {
  const rangeRe = /{(\d+)-(\d+):(\d+)}/g;
  let ranges = [];
  let prevRange = null;
  let prevRangeSpecLength = null;
  let result;
  while ((result = rangeRe.exec(spec)) !== null) {
    let newRange = {
      begin: Number.parseInt(result[1]),
      end: Number.parseInt(result[2]),
      step: Number.parseInt(result[3]),
      maxPadLength: result[1].length,
      specPos: result.index
    };
    if (prevRange != null) {
      prevRange.suffix = spec.substring(
        prevRange.specPos + prevRangeSpecLength, newRange.specPos);
    }
    ranges.push(newRange);
    prevRange = newRange;
    prevRangeSpecLength = result[0].length;
  }
  if (prevRange != null) {
    prevRange.suffix = spec.substring(
      prevRange.specPos + prevRangeSpecLength);
  }
  return ranges;
}

function nextRangeValue(range, current) {
  if (current == null) {
    return range.begin;
  }
  let nextValue = current + range.step;
  if (nextValue > range.end) {
    return null;
  }
  return nextValue;
}

function expandRange(collector, prefix, rangeIndex, ranges) {
  let range = ranges[rangeIndex];
  let currentValue = null;
  while ((currentValue = nextRangeValue(range, currentValue)) != null) {
    let current = padStart('' + currentValue, range.maxPadLength, '0');
    let newPrefix = prefix + current + range.suffix;
    if (rangeIndex + 1 == ranges.length) {
      collector.push(newPrefix);
    } else {
      expandRange(collector, newPrefix, rangeIndex + 1, ranges);
    }
  }
}

function expandUrlRangeSpec(spec) {
  let ranges = getRangesFromUrlRangeSpec(spec);
  if (ranges.length == 0) {
    return [spec];
  }
  let prefix = spec.substring(0, ranges[0].specPos);
  let urls = [];
  expandRange(urls, prefix, 0, ranges);
  return urls;
}

export default {
  detectRegions: detectRegions,
  getRegionText: getRegionText,
  rangeName: rangeName,
  replaceRegionsInUrl: replaceRegionsInUrl,
  getUrlRangeSpec: getUrlRangeSpec,
  expandUrlRangeSpec: expandUrlRangeSpec
}
