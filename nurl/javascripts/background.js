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
  console.log('messsage:', message);
  if (message.command == 'set-region') {
    tabSettingsMap[message.tabId] =
    new TabSettings(message.index, message.step, message.pad);
  } else if (message.command == 'load-with-delta') {
    updateActiveTabUrl(message.delta);
  } else if (message.command == 'get-range') {
    getRange(
      message.url, message.index,
      message.step, message.pad,
      message.begin, message.end);
  } else if (message.command == 'get-range-using-spec') {
    getRangeUsingSpec(message.spec);
  }
}

var ranageMap = {};

function getRange(url, index, step, pad, begin, end) {
  var regions = detectRegions(url);
  var region = regions[index];
  var i = begin;
  var urlList = [];
  while (i <= end) {
    urlList.push(region.newUrl(url, i, pad));
    i += step;
  }
  let title = common.rangeName(url, region);
  console.log('creating range of size' + urlList.length);
  browser.tabs.create({url:'/html/range.html'})
    .then((tab) => {
      browser.tabs.executeScript(tab.id, {file: '/javascripts/range.js'})
        .then((result) => {
            browser.tabs.sendMessage(tab.id, {
              url: url,
              title: title,
              urlList: urlList
            });
          });
        });
}

function getRangeUsingSpec(spec) {
  let urlList = common.expandUrlRangeSpec(spec);
  if (urlList.length == 0) {
    console.log('No urls for ' + spec);
    return;
  }
  console.log('creating range of size' + urlList.length);
  browser.tabs.create({url:'/html/range.html'})
    .then((tab) => {
      browser.tabs.executeScript(tab.id, {file: '/javascripts/range.js'})
        .then((result) => {
            browser.tabs.sendMessage(tab.id, {
              title: spec,
              urlList: urlList
            });
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
