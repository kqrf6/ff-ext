"use strict";

var detectRegions = window.common.detectRegions;

var newHighlighted = (url, regions) => {
  var index = 0
  var lastRegionEnd = 0;
  var result = ''
  for (let region of regions) {
    result += url.substring(lastRegionEnd, region.begin);
    let text = url.substr(region.begin, region.length);
    result +=
      `<span class='region' id='url${index}'>` + text + '</span>';
    lastRegionEnd = region.begin + region.length;
    index += 1;
  }
  return result + url.substr(lastRegionEnd);
}

class RegionElement {
  constructor(index, region, element) {
    this.index = index;
    this.region = region;
    this.element = element;
    this.step = 1;
    this.pad = region.startsWithZero();
  }
  toString () {
    return `RegionElement(${this.index}, ${this.region})`;
  }
}

function getAllRegionElements(regions) {
  var index = 0;
  var elements = []
  for (let region of regions) {
    elements.push(
      new RegionElement(index, region, document.getElementById(`url${index}`)));
    ++index;
  }
  return elements;
}

function selectRegion(clickedRegionElement, regionElements) {
  clickedRegionElement.element.classList.add('selected-region');
  updateInputForm(clickedRegionElement);
  console.log("clickedRegionElement: " + clickedRegionElement);
  for (let regEl of regionElements) {
    if (regEl != clickedRegionElement) {
      regEl.element.classList.remove('selected-region');
    }
  }
}

function updateInputForm(regionElement) {
  var input = document.getElementById('input');
  input.regionElement = regionElement;
  var stepInput = document.getElementById('step');
  stepInput.value = regionElement.step;
  var padInput = document.getElementById('pad');
  padInput.checked = regionElement.pad;
}

function stepChangeEventHandler(event) {
  var input = document.getElementById('input');
  var regionElement = input.regionElement;
  if (!regionElement) {
    console.log('No region selected');
    return;
  }
  regionElement.step = Number.parseInt(event.target.value);
}

function padChangeEventHandler(event) {
  var input = document.getElementById('input');okButton
  var regionElement = input.regionElement;
  if (!regionElement) {
    console.log('No region selected');
    return;
  }
  regionElement.pad = event.target.checked;
}

function sendSetRegionMessage(tabId) {
  var input = document.getElementById('input');
  var regionElement = input.regionElement;
  browser.runtime.sendMessage({
    command: 'set-region',
    tabId: tabId,
    index: regionElement.index,
    step: regionElement.step,
    pad: regionElement.pad
  });
}

function okButtonHandler() {
  browser.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      sendSetRegionMessage(tabs[0].id);
      browser.runtime.sendMessage({
        command: 'increment'
      });
    });
}

function rangeGetButtonHandler(url) {
  var input = document.getElementById('input');
  var regionElement = input.regionElement;
  var rangeBegin = document.getElementById('range-begin');
  var begin = Number.parseInt(rangeBegin.value);
  var rangeLength = document.getElementById('range-length');
  var length = Number.parseInt(rangeLength.value);
  browser.runtime.sendMessage({
    command: 'get-range',
    url: url,
    index: regionElement.index,
    step: regionElement.step,
    pad: regionElement.pad,
    begin: begin,
    end: begin + length
  });
}

function initialize(url) {
  console.log("Initializing...");
  var element = document.getElementById('src-url');
  var regions = detectRegions(url);
  element.innerHTML = newHighlighted(url, regions);
  var regionElements = getAllRegionElements(regions);
  for (let regionElement of regionElements) {
    regionElement.element.tabindex = regionElement.index;
    regionElement.element.onclick = function() {
      console.log("Region clicked: " + regionElement);
      selectRegion(regionElement, regionElements);
    };
  }

  var stepInput = document.getElementById('step');
  var padInput = document.getElementById('pad');
  stepInput.onchange = stepChangeEventHandler;
  padInput.onchange = padChangeEventHandler;

  var rightMostRegionElement = regionElements[regionElements.length - 1];
  selectRegion(rightMostRegionElement, regionElements);

  var okButton = document.getElementById('ok');
  okButton.onclick = okButtonHandler;

  var rangeGetButton = document.getElementById('range-get');
  rangeGetButton.onclick = function () {
    rangeGetButtonHandler(url);
  }
}

browser.tabs.query({active:true, currentWindow:true})
  .then((tabInfoList) => {
    for (let tab of tabInfoList) {
      initialize(tab.url);
    }
  });
