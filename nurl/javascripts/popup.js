/* global browser */
'use strict'
import common from './common.js'

var detectRegions = common.detectRegions
var getRegionText = common.getRegionText

function newHighlighted (url) {
  return common.replaceRegionsInUrl(url, (index, region, text) => {
    return `<span class='region' id='url${index}'>` + text + '</span>'
  })
}

class RegionElement {
  constructor (index, region, element, pad) {
    this.index = index
    this.region = region
    this.element = element
    this.pad = pad
    this.step = 1
  }
  toString () {
    return `RegionElement(${this.index}, ${this.region})`
  }
}

function getAllRegionElements (url, regions) {
  let index = 0
  let elements = []
  for (let region of regions) {
    let pad = getRegionText(url, region).startsWith('0')
    elements.push(
      new RegionElement(index, region,
        document.getElementById(`url${index}`), pad))
    ++index
  }
  return elements
}

function selectRegion (clickedRegionElement, regionElements) {
  clickedRegionElement.element.classList.add('selected-region')
  updateInputForm(clickedRegionElement)
  console.log('clickedRegionElement: ' + clickedRegionElement)
  for (let regEl of regionElements) {
    if (regEl !== clickedRegionElement) {
      regEl.element.classList.remove('selected-region')
    }
  }
}

function updateInputForm (regionElement) {
  var input = document.getElementById('input')
  input.regionElement = regionElement
  var stepInput = document.getElementById('step')
  stepInput.value = regionElement.step
  var padInput = document.getElementById('pad')
  padInput.checked = regionElement.pad
}

function stepChangeEventHandler (event) {
  var input = document.getElementById('input')
  var regionElement = input.regionElement
  if (!regionElement) {
    console.log('No region selected')
    return
  }
  regionElement.step = Number.parseInt(event.target.value)
}

function padChangeEventHandler (event) {
  var input = document.getElementById('input')
  var regionElement = input.regionElement
  if (!regionElement) {
    console.log('No region selected')
    return
  }
  regionElement.pad = event.target.checked
}

function sendSetRegionMessage (tabId) {
  var input = document.getElementById('input')
  var regionElement = input.regionElement
  browser.runtime.sendMessage({
    command: 'set-region',
    tabId: tabId,
    index: regionElement.index,
    step: regionElement.step,
    pad: regionElement.pad
  })
}

function loadWithDelta (delta) {
  browser.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      sendSetRegionMessage(tabs[0].id)
      browser.runtime.sendMessage({
        command: 'load-with-delta',
        delta: delta
      })
    })
}

function rangeGetButtonHandler (url) {
  var input = document.getElementById('input')
  var regionElement = input.regionElement
  var rangeBegin = document.getElementById('range-begin')
  var begin = Number.parseInt(rangeBegin.value)
  var rangeLength = document.getElementById('range-length')
  var length = Number.parseInt(rangeLength.value)
  browser.runtime.sendMessage({
    command: 'get-range',
    url: url,
    index: regionElement.index,
    step: regionElement.step,
    pad: regionElement.pad,
    begin: begin,
    end: begin + length
  })
}

function urlRangeSpecGetButtonHandler () {
  let urlRangeSpecInput = document.getElementById('url-range-spec')
  browser.runtime.sendMessage({
    command: 'get-range-using-spec',
    spec: urlRangeSpecInput.value
  })
}

function initialize (url) {
  console.log('Initializing...')
  var element = document.getElementById('src-url')
  var regions = detectRegions(url)
  element.innerHTML = newHighlighted(url, regions)
  let regionElements = getAllRegionElements(url, regions)
  for (let regionElement of regionElements) {
    regionElement.element.tabindex = regionElement.index
    regionElement.element.onclick = function () {
      console.log('Region clicked: ' + regionElement)
      selectRegion(regionElement, regionElements)
    }
  }

  var stepInput = document.getElementById('step')
  var padInput = document.getElementById('pad')
  stepInput.onchange = stepChangeEventHandler
  padInput.onchange = padChangeEventHandler

  var rightMostRegionElement = regionElements[regionElements.length - 1]
  selectRegion(rightMostRegionElement, regionElements)

  var loadNextButton = document.getElementById('load-next')
  loadNextButton.onclick = () => { loadWithDelta(1) }
  var loadPrevButton = document.getElementById('load-prev')
  loadPrevButton.onclick = () => { loadWithDelta(-1) }

  var rangeGetButton = document.getElementById('range-get')
  rangeGetButton.onclick = () => { rangeGetButtonHandler(url) }

  // URL Range Spec Section
  let urlRangeSpecInput = document.getElementById('url-range-spec')
  urlRangeSpecInput.value = common.getUrlRangeSpec(url, 20)
  let urlRangeSpecGetButton = document.getElementById('url-range-spec-get')
  urlRangeSpecGetButton.onclick = urlRangeSpecGetButtonHandler
}

browser.tabs.query({active: true, currentWindow: true})
  .then((tabInfoList) => {
    for (let tab of tabInfoList) {
      initialize(tab.url)
    }
  })
