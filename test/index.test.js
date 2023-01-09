const assert = require('assert');
const { requireMocha, MochaIndexFile } = require('..');

describe('test/index.test.js', () => {
  it('should export mocha class and index file path', () => {
    const Mocha = requireMocha();
    assert(Mocha);
    assert.equal(typeof Mocha, 'function');
    assert.equal(typeof Mocha.prototype.addFile, 'function');
    assert.equal(typeof MochaIndexFile, 'string');
  });
});
