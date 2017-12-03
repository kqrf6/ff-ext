"use strict";
console.log('range.js');

function handleMessage(request, sender, sendResponse) {
  console.log('request:', request);
  console.log(request);
  console.log(sender);
  console.log(sendResponse);
  document.title = request.title;
  let urlElement = document.getElementById('url');
  urlElement.href = request.url;
  for (let url of request.urlList) {
    var img = new Image();
    img.src = url;
    document.body.appendChild(img);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
