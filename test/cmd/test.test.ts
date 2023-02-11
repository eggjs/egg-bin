import path from 'path';
import coffee from 'coffee';
import mm from 'mm';

describe('test/cmd/test.test.ts', () => {
  const eggBin = path.join(__dirname, '../../bin/cli.ts');
  // const cwd = path.join(__dirname, '../fixtures/test-files');

  it('should auto require test/.setup.js', () => {
    mm(process.env, 'TESTS', 'test/a.test.js');
    return coffee.fork(eggBin, [ 'test', '--no-typescript' ], { cwd: path.join(__dirname, '../fixtures/setup-js') })
      .debug()
      .expect('stdout', /this is a before function/)
      .expect('stdout', /hello egg/)
      .expect('stdout', /is end!/)
      .expect('code', 0)
      .end();
  });

  it('should auto require test/.setup.ts', () => {
    mm(process.env, 'TESTS', 'test/a.test.ts');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd: path.join(__dirname, '../fixtures/setup-ts') })
      .debug()
      .expect('stdout', /this is a before function/)
      .expect('stdout', /hello egg/)
      .expect('stdout', /is end!/)
      .expect('code', 0)
      .end();
  });
});
