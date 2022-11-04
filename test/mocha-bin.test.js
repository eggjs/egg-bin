const path = require('path');
const coffee = require('coffee');

describe('test/mocha-bin.test.js', () => {
  const mochaBin = require.resolve('../bin/mocha.js');
  const cwd = path.join(__dirname, 'fixtures/mocha-test');

  it('should test with mocha', () => {
    return coffee.fork(mochaBin, [ 'test/*.test.js' ], { cwd })
      .debug()
      .expect('stdout', /2 passing/)
      .expect('code', 0)
      .end();
  });

  it('should test with mocha --parallel', () => {
    return coffee.fork(mochaBin, [ 'test/*.test.js', '--parallel' ], { cwd })
      .debug()
      .expect('stdout', /2 passing/)
      .expect('code', 0)
      .end();
  });
});
