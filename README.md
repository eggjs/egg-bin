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
[codecov-image]: https://codecov.io/gh/eggjs/egg-bin/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-bin
[david-image]: https://img.shields.io/david/eggjs/egg-bin.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-bin
[snyk-image]: https://snyk.io/test/npm/egg-bin/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bin
[download-image]: https://img.shields.io/npm/dm/egg-bin.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bin

egg developer tool

---

## Install

```bash
$ npm i egg-bin --save-dev
```

## Usage

Add `egg-bin` to `package.json` scripts:

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

Start dev cluster on `local` env, it will start a master, an agent and a worker.

```bash
$ egg-bin dev
```

### debug

Debug egg app with Chrome Developer Tools by [iron-node].

```bash
$ egg-bin debug
```

### test

Using [mocha] with [thunk-mocha] to run test.

You can set `TESTS` env to set the tests directory, it support [glob] grammar.

```bash
TESTS=test/a.test.js egg-bin test
```

And the reporter can set by the `TEST_REPORTER` env, default is `spec`.

```bash
TEST_REPORTER=doc egg-bin test
```

The test timeout can set by `TEST_TIMEOUT` env, default is `30000` ms.

```bash
TEST_TIMEOUT=2000 egg-bin test
```

### cov

Using [istanbul] to run code coverage, it support all test params above.

Coverage reporter will output text-summary, json and lcov.

## Custom egg-bin for your team

You maybe need a custom egg-bin to implement more custom features
if your team has develop a framework base on egg.

Now you can implement a [Program](lib/program.js) sub class,
and [Command](lib/command.js) sub class to do that.
Or you can just override the exists command.

### Example: Add [nsp] for security scan

[nsp] has provide a useful security scan feature.

This example will show you how to add a new `NspCommand` and `MyProgram`
to create a new `egg-bin` tool.

- Full demo: [my-egg-bin](test/fixtures/my-egg-bin)

#### [MyProgram](test/fixtures/my-egg-bin/lib/my_program.js)

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

#### [NspCommand](test/fixtures/my-egg-bin/lib/nsp_command.js)

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

run(require('../lib/my_program'));
```

#### Run result

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
[iron-node]: https://github.com/s-a/iron-node
