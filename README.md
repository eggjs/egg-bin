# egg-bin

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bin.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bin
[ci-image]: https://github.com/eggjs/egg-bin/actions/workflows/nodejs.yml/badge.svg
[ci-url]: https://github.com/eggjs/egg-bin/actions/workflows/nodejs.yml
[codecov-image]: https://codecov.io/gh/eggjs/egg-bin/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/egg-bin
[snyk-image]: https://snyk.io/test/npm/egg-bin/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bin
[download-image]: https://img.shields.io/npm/dm/egg-bin.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bin

egg developer tool, extends [@artus-cli/artus-cli].

---

## Install

```bash
npm i egg-bin --save-dev
```

## Usage

Add `egg-bin` to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "egg-bin dev",
    "test-local": "egg-bin test",
    "test": "npm run lint -- --fix && npm run test-local",
    "cov": "egg-bin cov",
    "lint": "eslint .",
    "ci": "npm run lint && npm run cov"
  }
}
```

## Command

All the commands support these specific options:

- `--inspect`
- `--inspect-brk`
- `--typescript` / `--ts` enable typescript support. Auto detect from `package.json`'s `pkg.egg.typescript`,
  or `pkg.dependencies.typescript`/`pkg.devDependencies.typescript`.
- `--base` / `--baseDir` application's root path, default to `process.cwd()`.
- `--require` will add to `execArgv`, support multiple. Also support read from `package.json`'s `pkg.egg.require`
- `--dry-run` / `-d` whether dry-run the test command, just show the command

```bash
egg-bin [command] --inspect
egg-bin [command] --inspect-brk
egg-bin [command] --typescript
egg-bin [command] --base /foo/bar
```

### dev

Start dev cluster on `local` env, it will start a master, an agent and a worker.

```bash
egg-bin dev
```

#### dev options

- `--framework` egg web framework root path.
- `--port` server port. If not specified, the port is obtained in the following order: [_egg.js_ configuration](https://www.eggjs.org/basics/config) `config/config.*.js` > `process.env.EGG_BIN_DEFAULT_PORT` > 7001 > other available ports.
- `--workers` worker process number, default to `1` worker at local mode.
- `--sticky` start a sticky cluster server, default to `false`.

#### debug/inspect on VSCode

Create `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Egg Debug",
      "runtimeExecutable": "npm",
      "runtimeArgs": [
        "run",
        "dev",
        "--",
        "--inspect-brk"
      ],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "auto",
      "port": 9229,
      "autoAttachChildProcesses": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Egg Test",
      "runtimeExecutable": "npm",
      "runtimeArgs": [
        "run",
        "test-local",
        "--",
        "--inspect-brk"
      ],
      "protocol": "auto",
      "port": 9229,
      "autoAttachChildProcesses": true
    }
  ]
}
```

### test

Using [mocha] to run test.

```bash
egg-bin test [...files] [options]
```

- `files` is optional, default to `test/**/*.test.ts`
- `test/fixtures`, `test/node_modules` is always exclude.

#### auto require `test/.setup.ts`

If `test/.setup.ts` file exists, it will be auto require as the first test file.

```bash
test
  ├── .setup.ts
  └── foo.test.ts
```

#### test options

You can pass any mocha argv.

- `--timeout` milliseconds, default to 60000
- `--changed` / `-c` only test changed test files(test files means files that match `${pwd}/test/**/*.test.(js|ts)`)
- `--parallel` enable mocha parallel mode, default to `false`.
- `--auto-agent` auto start agent in mocha master agent.
- `--jobs` number of jobs to run in parallel, default to `os.cpus().length - 1`.
- `--mochawesome` enable [mochawesome](https://github.com/adamgruber/mochawesome) reporter, default to `true`.

#### test environment

Environment is also support, will use it if options not provide.

You can set `TESTS` env to set the tests directory, it support [glob] grammar.

```bash
TESTS=test/a.test.ts egg-bin test
```

And the reporter can set by the `TEST_REPORTER` env, default is `spec`.

```bash
TEST_REPORTER=doc egg-bin test
```

The test timeout can set by `TEST_TIMEOUT` env, default is `60000` ms.

```bash
TEST_TIMEOUT=2000 egg-bin test
```

### cov

Using [mocha] and [c8] to run code coverage, it support all test params above.

Coverage reporter will output text-summary, json and lcov.

#### cov options

You can pass any mocha argv.

- `-x` add dir ignore coverage, support multiple argv
- `--prerequire` prerequire files for coverage instrument, you can use this options if load files slowly when call `mm.app` or `mm.cluster`
- `--typescript` / `--ts` enable typescript support. If true, will auto add `.ts` extension and ignore `typings` and `d.ts`.
- `--c8` c8 instruments passthrough. you can use this to overwrite egg-bin's default c8 instruments and add additional ones.
  >
  > - egg-bin have some default instruments passed to c8 like `-r` and `--temp-directory`
  > - `egg-bin cov --c8="-r teamcity -r text" --c8-report=true`
  >
- also support all test params above.

#### cov environment

You can set `COV_EXCLUDES` env to add dir ignore coverage.

```bash
COV_EXCLUDES="app/plugins/c*,app/autocreate/**" egg-bin cov
```

## Custom egg-bin for your team

See <https://artus-cli.github.io>

## License

[MIT](LICENSE)

<!-- GITCONTRIBUTOR_START -->

## Contributors

|[<img src="https://avatars.githubusercontent.com/u/156269?v=4" width="100px;"/><br/><sub><b>fengmk2</b></sub>](https://github.com/fengmk2)<br/>|[<img src="https://avatars.githubusercontent.com/u/227713?v=4" width="100px;"/><br/><sub><b>atian25</b></sub>](https://github.com/atian25)<br/>|[<img src="https://avatars.githubusercontent.com/u/360661?v=4" width="100px;"/><br/><sub><b>popomore</b></sub>](https://github.com/popomore)<br/>|[<img src="https://avatars.githubusercontent.com/u/5856440?v=4" width="100px;"/><br/><sub><b>whxaxes</b></sub>](https://github.com/whxaxes)<br/>|[<img src="https://avatars.githubusercontent.com/u/32174276?v=4" width="100px;"/><br/><sub><b>semantic-release-bot</b></sub>](https://github.com/semantic-release-bot)<br/>|[<img src="https://avatars.githubusercontent.com/u/985607?v=4" width="100px;"/><br/><sub><b>dead-horse</b></sub>](https://github.com/dead-horse)<br/>|
| :---: | :---: | :---: | :---: | :---: | :---: |
|[<img src="https://avatars.githubusercontent.com/u/6897780?v=4" width="100px;"/><br/><sub><b>killagu</b></sub>](https://github.com/killagu)<br/>|[<img src="https://avatars.githubusercontent.com/u/19908330?v=4" width="100px;"/><br/><sub><b>hyj1991</b></sub>](https://github.com/hyj1991)<br/>|[<img src="https://avatars.githubusercontent.com/u/2160731?v=4" width="100px;"/><br/><sub><b>mansonchor</b></sub>](https://github.com/mansonchor)<br/>|[<img src="https://avatars.githubusercontent.com/u/5243774?v=4" width="100px;"/><br/><sub><b>ngot</b></sub>](https://github.com/ngot)<br/>|[<img src="https://avatars.githubusercontent.com/u/1763067?v=4" width="100px;"/><br/><sub><b>waitingsong</b></sub>](https://github.com/waitingsong)<br/>|[<img src="https://avatars.githubusercontent.com/u/16103358?v=4" width="100px;"/><br/><sub><b>onlylovermb</b></sub>](https://github.com/onlylovermb)<br/>|
|[<img src="https://avatars.githubusercontent.com/u/19733683?v=4" width="100px;"/><br/><sub><b>snyk-bot</b></sub>](https://github.com/snyk-bot)<br/>|[<img src="https://avatars.githubusercontent.com/u/2755933?v=4" width="100px;"/><br/><sub><b>BiosSun</b></sub>](https://github.com/BiosSun)<br/>|[<img src="https://avatars.githubusercontent.com/u/1474688?v=4" width="100px;"/><br/><sub><b>luckydrq</b></sub>](https://github.com/luckydrq)<br/>|[<img src="https://avatars.githubusercontent.com/u/9213756?v=4" width="100px;"/><br/><sub><b>gxkl</b></sub>](https://github.com/gxkl)<br/>|[<img src="https://avatars.githubusercontent.com/u/415655?v=4" width="100px;"/><br/><sub><b>stormslowly</b></sub>](https://github.com/stormslowly)<br/>|[<img src="https://avatars.githubusercontent.com/u/11251401?v=4" width="100px;"/><br/><sub><b>Solais</b></sub>](https://github.com/Solais)<br/>|
|[<img src="https://avatars.githubusercontent.com/u/52845048?v=4" width="100px;"/><br/><sub><b>snapre</b></sub>](https://github.com/snapre)<br/>|[<img src="https://avatars.githubusercontent.com/u/23313266?v=4" width="100px;"/><br/><sub><b>ZYSzys</b></sub>](https://github.com/ZYSzys)<br/>|[<img src="https://avatars.githubusercontent.com/u/25807379?v=4" width="100px;"/><br/><sub><b>angleshe</b></sub>](https://github.com/angleshe)<br/>|[<img src="https://avatars.githubusercontent.com/u/26563778?v=4" width="100px;"/><br/><sub><b>ahungrynoob</b></sub>](https://github.com/ahungrynoob)<br/>|[<img src="https://avatars.githubusercontent.com/u/863430?v=4" width="100px;"/><br/><sub><b>yinseny</b></sub>](https://github.com/yinseny)<br/>|[<img src="https://avatars.githubusercontent.com/u/13450124?v=4" width="100px;"/><br/><sub><b>liuhanqu</b></sub>](https://github.com/liuhanqu)<br/>|
[<img src="https://avatars.githubusercontent.com/u/2127199?v=4" width="100px;"/><br/><sub><b>okoala</b></sub>](https://github.com/okoala)<br/>

This project follows the git-contributor [spec](https://github.com/xudafeng/git-contributor), auto updated at `Sat Jun 03 2023 16:58:54 GMT+0800`.

<!-- GITCONTRIBUTOR_END -->

[mocha]: https://mochajs.org
[glob]: https://github.com/isaacs/node-glob
[@artus-cli/artus-cli]: https://github.com/artus-cli/artus-cli
