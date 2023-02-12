import path from 'node:path';
import mm from 'mm';
import coffee from '../coffee';

describe('test/cmd/debug.test.ts', () => {
  const eggBin = path.join(__dirname, '../../src/bin/cli.ts');
  const fixtures = path.join(__dirname, '../fixtures');
  const cwd = path.join(fixtures, 'demo-app');

  afterEach(mm.restore);

  it('should startCluster success', () => {
    return coffee.fork(eggBin, [ 'debug' ], { cwd })
      // .debug()
      .expect('stdout', /"workers":1/)
      .expect('stdout', /"baseDir":".*?demo-app"/)
      .expect('stdout', /"framework":".*?aliyun-egg"/)
      .expect('stdout', /NODE_ENV: development/)
      .expect('stderr', /Debugger listening/)
      .expect('code', 0)
      .end();
  });
});
