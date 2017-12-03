import common from './common.js';

test('detects regions', () => {
  let url = 'http://a.c.c/1/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(3);
  expect(regionList[0].step(url, 3, false)).toBe('http://a.c.c/4/a02/12c');
  expect(regionList[1].step(url, 3, false)).toBe('http://a.c.c/1/a5/12c');
});

test('step with padding', () => {
  let url = 'http://a.c.c/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(2);
  let firstRegion = regionList[0];
  expect(firstRegion.step(url, 3, true)).toBe('http://a.c.c/a05/12c');
  expect(firstRegion.step(url, 98, true)).toBe('http://a.c.c/a100/12c');

  let secondRegion = regionList[1];
  expect(secondRegion.step(url, -3, true)).toBe('http://a.c.c/a02/09c');
});

test('step without padding', () => {
  let url = 'http://a.c.c/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(2);
  let firstRegion = regionList[0];
  expect(firstRegion.step(url, 3, false)).toBe('http://a.c.c/a5/12c');
  expect(firstRegion.step(url, 98, false)).toBe('http://a.c.c/a100/12c');

  let secondRegion = regionList[1];
  expect(secondRegion.step(url, -3, false)).toBe('http://a.c.c/a02/9c');
});

test('rangeName', () => {
  let url = 'http://a.c.c/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(2);
  let secondRegion = regionList[1];
  expect(common.rangeName(url, secondRegion)).toBe('http-a.c.c_a02');
});

test('replaceRegionsInUrl', () => {
  let url = 'http://a.c.c/a02/12c';
  let result = common.replaceRegionsInUrl(url, (index, region, text) => {
    return `<span id='url${index}'>` + text + '</span>'
  });
  expect(result).toBe("http://a.c.c/a<span id='url0'>02</span>/<span id='url1'>12</span>c");
});

test('getUrlRangeSpec', () => {
  let url = 'http://a.c.c/a02/12c';
  let result = common.getUrlRangeSpec(url);
  expect(result).toBe("http://a.c.c/a{02-02:1}/{12-12:1}c");
});

test('getUrlRangeSpec with last region end', () => {
  let url = 'http://a.c.c/a02/002c';
  let result = common.getUrlRangeSpec(url, 20);
  expect(result).toBe("http://a.c.c/a{02-02:1}/{002-022:1}c");
});


test('expand ranges', () => {
  let result = common.expandUrlRangeSpec(
    'http://a.c.c/a{08-10:1}/{12-14:2}c');
  expect(result).toEqual([
    'http://a.c.c/a08/12c',
    'http://a.c.c/a08/14c',
    'http://a.c.c/a09/12c',
    'http://a.c.c/a09/14c',
    'http://a.c.c/a10/12c',
    'http://a.c.c/a10/14c',
  ]);
});
