function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function sumArray(arr) {
  if (!Array.isArray(arr)) throw new Error('Input must be an array');
  return arr.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
}

module.exports = {
  generateId,
  capitalize,
  sumArray,
};
