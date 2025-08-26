const applyFilter = require('../applyFilter');

describe('applyFilter', () => {
  test('counts words correctly', () => {
    const result = applyFilter('bad dog, bad cat', ['bad']);
    expect(result.count).toBe(2);
  });

  test('escapes regex metacharacters in word list', () => {
    const result = applyFilter('C++ is great, I use c++ daily.', ['c++']);
    expect(result.count).toBe(2);
  });

  test('respects word boundaries', () => {
    const result = applyFilter('The bad dog was bad, not a badger.', ['bad']);
    expect(result.count).toBe(2);
  });
});
