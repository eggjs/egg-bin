const fs = require('fs/promises');
const path = require('path');
const coffee = require('coffee');

describe('test/ets-bin.test.js', () => {
  const etsBin = require.resolve('../bin/ets.js');
  const postinstallScript = require.resolve('../bin/postinstall.js');
  const cwd = path.join(__dirname, 'fixtures/example-ts-ets');

  beforeEach(async () => {
    await fs.rm(path.join(cwd, 'typings'), { force: true, recursive: true });
  });

  it('should test with ets', () => {
    return coffee.fork(etsBin, [], {
      cwd,
      env: Object.assign({}, process.env, {
        ETS_SILENT: 'false',
      }),
    })
      .debug()
      .expect('stdout', /\[egg-ts-helper\] create/)
      .expect('code', 0)
      .end();
  });

  it('should test with postinstall', async () => {
    await coffee.spawn('node', [ postinstallScript ], {
      cwd,
      env: {
        ...process.env,
        ETS_SILENT: 'false',
        INIT_CWD: cwd,
      },
    })
      .debug()
      .expect('stdout', /\[egg-ts-helper\] create/)
      .expect('stdout', /\[egg-bin:postinstall] run /)
      .expect('code', 0)
      .end();

    await fs.rm(path.join(cwd, 'typings'), { force: true, recursive: true });
    await coffee.spawn('node', [ postinstallScript, require.resolve('egg-ts-helper/dist/bin') ], {
      cwd,
      env: {
        ...process.env,
        ETS_SILENT: 'false',
        INIT_CWD: cwd,
      },
    })
      .debug()
      .expect('stdout', /\[egg-ts-helper\] create/)
      .expect('stdout', /\[egg-bin:postinstall] run /)
      .expect('code', 0)
      .end();
  });

  it('should test with postinstall ignore eggModule', async () => {
    const cwd = path.join(__dirname, 'fixtures/example-egg-module-ets');
    await coffee.spawn('node', [ postinstallScript ], {
      cwd,
      env: {
        ...process.env,
        ETS_SILENT: 'false',
        INIT_CWD: cwd,
      },
    })
      .debug()
      .notExpect('stdout', /\[egg-ts-helper\] create/)
      .notExpect('stdout', /\[egg-bin:postinstall] run /)
      .expect('code', 0)
      .end();
  });

  it('should test with postinstall ignore egg framework', async () => {
    const cwd = path.join(__dirname, 'fixtures/example-egg-framework-ets');
    await coffee.spawn('node', [ postinstallScript ], {
      cwd,
      env: {
        ...process.env,
        ETS_SILENT: 'false',
        INIT_CWD: cwd,
      },
    })
      .debug()
      .notExpect('stdout', /\[egg-ts-helper\] create/)
      .notExpect('stdout', /\[egg-bin:postinstall] run /)
      .expect('code', 0)
      .end();
  });
});
