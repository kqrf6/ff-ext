/* global Image, browser */
'use strict'

import common from './common.js'
console.log('range.js')

function loadImages (spec) {
  let urlList = common.expandUrlRangeSpec(spec)
  let imagesSection = document.getElementById('images')
  for (let url of urlList) {
    var img = new Image()
    img.src = url
    imagesSection.appendChild(img)
  }
  let loadMoreButton = document.getElementById('load-more')
  loadMoreButton.onclick = () => loadMoreButtonHandler(spec)
}

function loadMoreButtonHandler (spec) {
  // let element = document.getElementById('spec');
  // let spec = element.innerText;
  spec = common.nextUrlRangeSpec(spec, 5)
  console.log('new spec:', spec)
  loadImages(spec)
}

function handleMessage (request, sender, sendResponse) {
  console.log('request:', request)
  console.log(request)
  console.log(sender)
  console.log(sendResponse)
  if (request.title != null) {
    document.title = request.title
  }
  if (request.url != null) {
    let urlElement = document.getElementById('url')
    urlElement.href = request.url
  }
  if (request.spec != null) {
    let element = document.getElementById('spec')
    element.innerText = request.spec
    loadImages(request.spec)
  }
}

browser.runtime.onMessage.addListener(handleMessage)
