# egg-bin

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bin.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bin
[travis-image]: https://img.shields.io/travis/eggjs/egg-bin.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-bin
[codecov-image]: https://codecov.io/github/eggjs/egg-bin/coverage.svg?branch=master
[codecov-url]: https://codecov.io/github/eggjs/egg-bin?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-bin.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bin
[snyk-image]: https://snyk.io/test/npm/egg-bin/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bin
[download-image]: https://img.shields.io/npm/dm/egg-bin.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bin

egg 开发者辅助工具

---

## Install

```bash
$ npm i egg-bin --save-dev
```

## Usage

使用 `egg-bin` 来配置 `package.json` scripts:

```json
{
  "devDependencies": {
    "egg-bin": "1"
  },
  "scripts": {
    "dev": "egg-bin dev",
    "debug": "egg-bin debug",
    "test": "egg-bin test",
    "cov": "egg-bin cov",
    "lint": "eslint .",
    "ci": "npm run lint && npm run cov"
  }
}
```

## Command

### dev

以 local 环境模式启动当前应用，将启动一个 master，一个 agent，一个 worker。

```bash
$ egg-bin dev
```

### debug

使用 iron-node 调试工具启动应用。

```bash
$ egg-bin debug
```

### test

测试工具，使用 [mocha]，支持 [thunk-mocha] 扩展。

可通过 `TESTS` 环境变量指定具体文件，支持 [glob]。

```bash
TESTS=test/a.test.js egg-bin test
```

通过 `TEST_REPORTER` 环境变量指定 reporter，默认为 spec。

```bash
TEST_REPORTER=doc egg-bin test
```

通过 `TEST_TIMEOUT` 环境变量指定超时时间，默认 30000ms。

```bash
TEST_TIMEOUT=2000 egg-bin test
```

### cov

覆盖率工具，使用 [istanbul]，支持 test 所有参数。

支持的表报有 text-summary，json，lcov，并通过 [alicov] 上传。

## 定制属于你团队的 egg-bin

如果你的团队已经基于 egg 开发了属于自己的框架，那么很可能你会需要在 egg-bin 上做更多自定义功能。
egg-bin 已经早为此做好准备，通过实现 [Program](lib/Program.js) 的子类，
可以添加新的 [Command](lib/Command.js)，或者覆盖现有的 Command 来实现自定义功能。

### 示例：增加 [nsp] 安全扫描命令

[nsp] 提供了一个非常有用的依赖模块安全扫描功能，
这个例子将展示如何通过添加新的 NspCommand 类和 MyProgram 类来实现一个新的 egg-bin 工具。

- 完整示例代码：[my-egg-bin](test/fixtures/my-egg-bin)

#### [MyProgram.js](test/fixtures/my-egg-bin/lib/MyProgram.js)

```js
const Program = require('egg-bin').Program;

class MyProgram extends Program {
  constructor() {
    super();
    this.version = require('../package.json').version;

    this.addCommand('nsp', path.join(__dirname, 'NspCommand.js'));
  }
}

module.exports = MyProgram;
```

#### [NspCommand.js](test/fixtures/my-egg-bin/lib/NspCommand.js)

```js
const Command = require('egg-bin').Command;

class NspCommand extends Command {
  * run(cwd, args) {
    console.log('run nsp check at %s with %j', cwd, args);
  }

  help() {
    return 'nsp check';
  }
}

module.exports = NspCommand;
```

#### [my-egg-bin.js](test/fixtures/my-egg-bin/bin/my-egg-bin.js)

```js
#!/usr/bin/env node

'use strict';

const run = require('egg-bin').run;

run(require('../lib/MyProgram'));
```

#### 运行结果

```bash
$ my-egg-bin nsp

run nsp check at /foo/bar with []
```

## License

[MIT](LICENSE)


[mocha]: https://mochajs.org
[thunk-mocha]: https://npmjs.com/thunk-mocha
[glob]: https://github.com/isaacs/node-glob
[istanbul]: https://github.com/gotwarlost/istanbul
[nsp]: https://npmjs.com/thunk-mocha
