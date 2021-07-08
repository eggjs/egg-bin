'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const fs = require('fs');
const rimraf = require('mz-modules/rimraf');
const os = require('os');

describe('test/ts.test.js', () => {
  const eggBin = require.resolve('../bin/egg-bin');
  let cwd;

  afterEach(mm.restore);

  it('should support ts', () => {
    cwd = path.join(__dirname, './fixtures/ts');
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'dev', '--typescript' ], { cwd })
      // .debug()
      .expect('stdout', /options.typescript=true/)
      .expect('stdout', /started/)
      .expect('code', 0)
      .end();
  });

  it('should support ts test', () => {
    cwd = path.join(__dirname, './fixtures/ts');
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd })
      // .debug()
      .notExpect('stdout', /false == true/)
      .notExpect('stdout', /should not load js files/)
      .expect('stdout', /--- \[string\] 'wrong assert ts'/)
      .expect('code', 1)
      .end();
  });

  describe('real application', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts');
    });

    it('should start app', () => {
      return coffee.fork(eggBin, [ 'dev', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 12345/)
        .expect('stdout', /ts env: true/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should test app', () => {
      return coffee.fork(eggBin, [ 'test', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', /ts env: true/)
        .expect('stdout', /should work/)
        .expect('code', 0)
        .end();
    });

    it('should cov app', () => {
      return coffee.fork(eggBin, [ 'cov', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', /ts env: true/)
        .expect('stdout', process.env.NYC_ROOT_ID ? /Coverage summary/ : /Statements.*100%/)
        .expect('code', 0)
        .end();
    });

    it('should cov app in cluster mod', () => {
      cwd = path.join(__dirname, './fixtures/example-ts-cluster');
      return coffee.fork(eggBin, [ 'cov', '--ts' ], { cwd })
        .debug()
        .expect('stdout', process.env.NYC_ROOT_ID || os.platform() === 'win32' ? /Coverage summary/ : /Statements.*100%/)
        .expect('code', 0)
        .end();
    });
  });

  describe('error stacks', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts-error-stack');
    });

    it('should correct error stack line number in starting app', () => {
      mm(process.env, 'THROW_ERROR', 'true');
      return coffee.fork(eggBin, [ 'dev' ], { cwd })
        // .debug()
        .expect('stderr', /Error: throw error/)
        .expect('stderr', /at \w+ \(.+app\.ts:7:11\)/)
        .end();
    });

    it('should correct error stack line number in testing app', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        .debug()
        .expect('stdout', /error/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:8:11\)/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:14:5\)/)
        .expect('stdout', /assert\(obj\.key === '222'\)/)
        .expect('stdout', /| {3}| {3}|/)
        .expect('stdout', /| {3}| {3}false/)
        .expect('stdout', /| {3}"111"/)
        .expect('stdout', /Object\{key:"111"}/)
        .end();
    });

    it('should correct error stack line number in testing app with other tscompiler', () => {
      return coffee.fork(eggBin, [ 'test', '--tscompiler=esbuild-register' ], { cwd })
        .debug()
        .expect('stdout', /error/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:8:11\)/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:14:5\)/)
        .expect('stdout', /assert\(obj\.key === "222"\)/)
        .expect('stdout', /| {3}| {3}|/)
        .expect('stdout', /| {3}| {3}false/)
        .expect('stdout', /| {3}"111"/)
        .expect('stdout', /Object\{key:"111"}/)
        .end();
    });

    it('should correct error stack line number in covering app', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /error/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:8:11\)/)
        .expect('stdout', /test[\/\\]{1}index\.test\.ts:14:5\)/)
        .expect('stdout', /assert\(obj\.key === '222'\)/)
        .expect('stdout', /| {3}| {3}|/)
        .expect('stdout', /| {3}| {3}false/)
        .expect('stdout', /| {3}"111"/)
        .expect('stdout', /Object\{key:"111"}/)
        .end();
    });
  });

  describe('egg.typescript = true', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts-pkg');
    });

    it('should start app', () => {
      return coffee.fork(eggBin, [ 'dev' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 12345/)
        .expect('stdout', /ts env: true/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should fail start app with --no-ts', () => {
      return coffee.fork(eggBin, [ 'dev', '--no-ts' ], { cwd })
        // .debug()
        .expect('stdout', /agent.options.typescript = false/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should start app with flags in app without eggInfo', async () => {
      const cwd = path.join(__dirname, './fixtures/example-ts-simple');
      await coffee.fork(eggBin, [ 'dev', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();

      await coffee.fork(eggBin, [ 'dev', '--ts', '--tsc=esbuild-register' ], { cwd })
        // .debug()
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should start app with other tscompiler without error', () => {
      return coffee.fork(eggBin, [ 'dev', '--ts', '--tscompiler=esbuild-register' ], {
        cwd: path.join(__dirname, './fixtures/example-ts'),
      })
        // .debug()
        .expect('stdout', /agent.options.typescript = true/)
        .expect('stdout', /agent.options.tscompiler = esbuild-register/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should start app with other tscompiler in package.json without error', () => {
      return coffee.fork(eggBin, [ 'dev', '--ts' ], {
        cwd: path.join(__dirname, './fixtures/example-ts-pkg'),
      })
        // .debug()
        .expect('stdout', /agent.options.typescript = true/)
        .expect('stdout', /agent.options.tscompiler = esbuild-register/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should test app', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', /ts env: true/)
        .expect('code', 0)
        .end();
    });

    it('should cov app', () => {
      return coffee.fork(eggBin, [ 'cov' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', /ts env: true/)
        .expect('stdout', process.env.NYC_ROOT_ID ? /Coverage summary/ : /Statements.*100%/)
        .expect('code', 0)
        .end();
    });
  });

  describe('egg.declarations = true', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    let pkgJson;
    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts-ets');
      pkgJson = JSON.parse(fs.readFileSync(path.resolve(cwd, './package.json')).toString());
    });

    beforeEach(() => rimraf(path.resolve(cwd, './typings')));

    afterEach(() => {
      pkgJson.egg.declarations = false;
      fs.writeFileSync(path.resolve(cwd, './package.json'), JSON.stringify(pkgJson, null, 2));
    });

    it('should load egg-ts-helper with dts flag', () => {
      return coffee.fork(eggBin, [ 'dev', '--dts' ], { cwd })
        // .debug()
        .expect('stdout', /application log/)
        .expect('stdout', /"typescript":true/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should load egg-ts-helper with egg.declarations = true', () => {
      pkgJson.egg.declarations = true;
      fs.writeFileSync(path.resolve(cwd, './package.json'), JSON.stringify(pkgJson, null, 2));

      return coffee.fork(eggBin, [ 'dev' ], { cwd })
        // .debug()
        .expect('stdout', /application log/)
        .expect('stdout', /"typescript":true/)
        .expect('stdout', /"declarations":true/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should not load egg-ts-helper without flag and egg.declarations', () => {
      return coffee.fork(eggBin, [ 'dev' ], { cwd })
        // .debug()
        .expect('stdout', /"typescript":true/)
        .notExpect('stdout', /application log/)
        .notExpect('stdout', /"declarations":true/)
        .notExpect('stdout', /started/)
        .expect('code', 1)
        .end();
    });
  });
});
