const common = require('./common');

test('detects regions', () => {
  let url = 'http://a.c.c/1/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(3);
  expect(regionList[0].step(3, false)).toBe('http://a.c.c/4/a02/12c');
  expect(regionList[1].step(3, false)).toBe('http://a.c.c/1/a5/12c');
});

test('step with padding', () => {
  let url = 'http://a.c.c/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(2);
  let firstRegion = regionList[0];
  expect(firstRegion.step(3, true)).toBe('http://a.c.c/a05/12c');
  expect(firstRegion.step(98, true)).toBe('http://a.c.c/a100/12c');

  let secondRegion = regionList[1];
  expect(secondRegion.step(-3, true)).toBe('http://a.c.c/a02/09c');
});

test('step without padding', () => {
  let url = 'http://a.c.c/a02/12c';
  let regionList = common.detectRegions(url);
  expect(regionList.length).toBe(2);
  let firstRegion = regionList[0];
  expect(firstRegion.step(3, false)).toBe('http://a.c.c/a5/12c');
  expect(firstRegion.step(98, false)).toBe('http://a.c.c/a100/12c');

  let secondRegion = regionList[1];
  expect(secondRegion.step(-3, false)).toBe('http://a.c.c/a02/9c');
});
