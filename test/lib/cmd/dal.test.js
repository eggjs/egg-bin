const path = require('node:path');
const coffee = require('coffee');
const mm = require('mm');
const fs = require('node:fs/promises');
const assert = require('assert');

describe('test/lib/cmd/dal.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/dal');
  const cwd2 = path.join(__dirname, '../../fixtures/dal-with-ts-error');

  afterEach(mm.restore);

  describe('egg-bin dal gen', () => {
    after(async () => {
      await fs.rm(path.join(cwd, 'app/modules/dal/dal'), {
        force: true,
        recursive: true,
      });
      await fs.rm(path.join(cwd2, 'app/modules/dal/dal'), {
        force: true,
        recursive: true,
      });
    });

    it('egg-bin dal gen should work', async () => {
      await coffee.fork(eggBin, [ 'dal', 'gen', '--teggPkgName', '@eggjs/xianyadan', '--teggDalPkgName', '@eggjs/xianyadan/dal' ], { cwd })
        .debug()
        // .expect('code', 0)
        .end();

      for (const file of [
        'app/modules/dal/dal/dao/BarDAO.ts',
        'app/modules/dal/dal/dao/FooDAO.ts',
        'app/modules/dal/dal/dao/base/BaseBarDAO.ts',
        'app/modules/dal/dal/dao/base/BaseFooDAO.ts',
        'app/modules/dal/dal/extension/BarExtension.ts',
        'app/modules/dal/dal/extension/FooExtension.ts',
        'app/modules/dal/dal/structure/Bar.json',
        'app/modules/dal/dal/structure/Bar.sql',
        'app/modules/dal/dal/structure/Foo.json',
        'app/modules/dal/dal/structure/Foo.sql',
      ]) {
        assert.ok(await fs.stat(path.join(cwd, file)));
      }

      const content = await fs.readFile(path.join(cwd, 'app/modules/dal/dal/dao/base/BaseFooDAO.ts'), 'utf8');
      assert(/import type { InsertResult, UpdateResult, DeleteResult } from '@eggjs\/xianyadan\/dal';/.test(content));
      assert(/import { Inject } from '@eggjs\/xianyadan';/.test(content));
    });

    it.skip('egg-bin dal gen with ts error should work', async () => {
      const cwd = path.join(__dirname, '../../fixtures/dal-with-ts-error');
      await coffee.fork(eggBin, [ 'dal', 'gen', '--teggPkgName', '@eggjs/xianyadan', '--teggDalPkgName', '@eggjs/xianyadan/dal' ], {
        cwd: cwd2,
      })
        .debug()
        // .expect('code', 0)
        .end();

      for (const file of [
        'app/modules/dal/dal/dao/BarDAO.ts',
        'app/modules/dal/dal/dao/FooDAO.ts',
        'app/modules/dal/dal/dao/base/BaseBarDAO.ts',
        'app/modules/dal/dal/dao/base/BaseFooDAO.ts',
        'app/modules/dal/dal/extension/BarExtension.ts',
        'app/modules/dal/dal/extension/FooExtension.ts',
        'app/modules/dal/dal/structure/Bar.json',
        'app/modules/dal/dal/structure/Bar.sql',
        'app/modules/dal/dal/structure/Foo.json',
        'app/modules/dal/dal/structure/Foo.sql',
      ]) {
        assert.ok(await fs.stat(path.join(cwd, file)));
      }

      const content = await fs.readFile(path.join(cwd, 'app/modules/dal/dal/dao/base/BaseFooDAO.ts'), 'utf8');
      assert(/import type { InsertResult, UpdateResult, DeleteResult } from '@eggjs\/xianyadan\/dal';/.test(content));
      assert(/import { Inject } from '@eggjs\/xianyadan';/.test(content));
    });
  });
});
