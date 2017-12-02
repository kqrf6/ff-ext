"use strict";

import common from './common.js';
var detectRegions = common.detectRegions;

class TabSettings {
  constructor(regionIndex, step, pad) {
    this.regionIndex = regionIndex;
    this.step = step;
    this.pad = pad;
  }

  stepUrl(url, direction) {
    let regions = detectRegions(url);
    return regions[this.regionIndex].step(url, direction * this.step, this.pad);
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  browser.pageAction.show(tabId);
});

var tabSettingsMap = {};

function handleMessage(message) {
  console.log('messsage command:' + message.command);
  if (message.command == 'set-region') {
    tabSettingsMap[message.tabId] =
    new TabSettings(message.index, message.step, message.pad);
  } else if (message.command == 'increment') {
    console.log('increment');
    updateActiveTabUrl(1);
  } else if (message.command == 'get-range') {
    getRange(
      message.url, message.index,
      message.step, message.pad,
      message.begin, message.end);
  }
}

var ranageMap = {};

function getRange(url, index, step, pad, begin, end) {
  var regions = detectRegions(url);
  var region = regions[index];
  var i = begin;
  var urlList = [];
  while (i <= end) {
    var url = region.newUrl(url, i, pad);
    urlList.push(url);
    i += step;
  }
  console.log('creating range of size' + urlList.length);
  browser.tabs.create({url:'/html/range.html'})
    .then((tab) => {
      browser.tabs.executeScript(tab.id, {file: '/javascripts/range.js'})
        .then((result) => {
            browser.tabs.sendMessage(tab.id, {url: url, urlList: urlList});
          });
        });
}

function updateActiveTabUrl(dir) {
  browser.tabs.query({active: true, currentWindow: true})
    .then((tabs) => {
      let tabId = tabs[0].id;
      let newUrl = tabSettingsMap[tabId].stepUrl(tabs[0].url, dir);
      console.log('newUrl:'+newUrl);
      browser.tabs.update(tabId, {url: newUrl});
    });
}

function handleCommand(command) {
  console.log('command:'+command);
  if (command == 'url-up') {
    updateActiveTabUrl(1);
  } else if (command == 'url-down') {
    updateActiveTabUrl(-1);
  }
}

browser.runtime.onMessage.addListener(handleMessage);
browser.commands.onCommand.addListener(handleCommand);
