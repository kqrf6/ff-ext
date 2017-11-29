const common = require('./common');

test('detects regions', () => {
  var url = 'http://a.c.c/1/a02/12c';
  var regionList = common.detectRegions(url);
  expect(regionList.length).toBe(3);
  expect(regionList[0].step(3, false)).toBe('http://a.c.c/4/a02/12c');
  expect(regionList[1].step(3, false)).toBe('http://a.c.c/1/a5/12c');
});
