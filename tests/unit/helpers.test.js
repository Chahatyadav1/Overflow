const helpers = require('../../src/utils/helpers');

describe('Helpers', () => {
  test('generateId returns string of length 7', () => {
    const id = helpers.generateId();
    expect(typeof id).toBe('string');
    expect(id).toHaveLength(7);
  });

  test('capitalize formats correctly', () => {
    expect(helpers.capitalize('hello')).toBe('Hello');
    expect(helpers.capitalize('HELLO')).toBe('Hello');
    expect(helpers.capitalize('')).toBe('');
    expect(helpers.capitalize(null)).toBe('');
  });

  test('sumArray sums numbers', () => {
    expect(helpers.sumArray([1, 2, 3])).toBe(6);
    expect(helpers.sumArray([1, 'a', 3])).toBe(4);
    expect(helpers.sumArray([])).toBe(0);
    expect(() => helpers.sumArray('not array')).toThrow('Input must be an array');
  });
});
