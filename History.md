
4.3.6 / 2017-11-30
==================

  * deps: autod@3.0 (#85)
  * test: Node 8.7.0 has improved stack for promise (#84)

4.3.5 / 2017-10-10
==================

**fixes**
  * [[`7386194`](http://github.com/eggjs/egg-bin/commit/7386194d94ec8b0d0faee766fe98f0f4f2ece8a2)] - fix: force exit when runner complete (#83) (Haoliang Gao <<sakura9515@gmail.com>>)

**others**
  * [[`a7c4b53`](http://github.com/eggjs/egg-bin/commit/a7c4b53c3aab8ee4a7c3c65e39f6480de97a9ea1)] - chore: remove incorrect history (#82) (Haoliang Gao <<sakura9515@gmail.com>>)

4.3.4 / 2017-10-09
==================

Upgrade mocha@4, see https://boneskull.com/mocha-v4-nears-release

**fixes**
  * [[`e3c33e9`](http://github.com/eggjs/egg-bin/commit/e3c33e9fbc8c67ce733237ff7c0c41f35654712f)] - fix: package.json to reduce vulnerabilities (#81) (Snyk bot <<snyk-bot@users.noreply.github.com>>)


4.3.3 / 2017-09-21
==================

  * chore: dont print devtools link at vscode (#75)

4.3.2 / 2017-09-14
==================

**fixes**
  * [[`2e3498e`](http://github.com/eggjs/egg-bin/commit/2e3498e6ca1b81814a2d1a4db4a8a37fb0d6d880)] - fix: use inspector at 7.x+ (#74) (TZ | 天猪 <<atian25@qq.com>>)

4.3.1 / 2017-09-13
==================

**features**
  * [[`678b83d`](http://github.com/eggjs/egg-bin/commit/678b83d64ad850ac390607ee281e5336473da808)] - feat: debug proxy support (TZ <<atian25@qq.com>>)
  * [[`c65a00d`](http://github.com/eggjs/egg-bin/commit/c65a00dc69fbca3924bcd848c94bc0b11a3ee17a)] - feat: revert to 4.2.0 (TZ <<atian25@qq.com>>)

**fixes**
  * [[`469739f`](http://github.com/eggjs/egg-bin/commit/469739f1b494c647fcb06e0db432d435ed9e1805)] - fix: debug at 6.x (TZ <<atian25@qq.com>>)

**others**
  * [[`2be5245`](http://github.com/eggjs/egg-bin/commit/2be52459ed22dd3c0a22b080f7e29ae876d2914f)] - docs: add readme (TZ <<atian25@qq.com>>)
  * [[`3e8ce0d`](http://github.com/eggjs/egg-bin/commit/3e8ce0d3aaaea793f466b768f45f77e4fcc7b001)] - refactor: use common-bin parse execArgv (TZ <<atian25@qq.com>>)

4.3.0 / 2017-09-07
==================

**others**
  * [[`83afba3`](http://github.com/eggjs/egg-bin/commit/83afba3a43e9e7d233263f6deba792d1f4c1a1d9)] - deps: update common-bin (TZ <<atian25@qq.com>>)
  * [[`f7628b2`](http://github.com/eggjs/egg-bin/commit/f7628b22042168d522b9b69344c9a54ab1fa1305)] - refactor: egg-bin debug pass debugOptions to startCluster (TZ <<atian25@qq.com>>)
  * [[`831c77d`](http://github.com/eggjs/egg-bin/commit/831c77d3d0a269e1ab1243471ef34bb53df0fb80)] - refactor: use common-bin parse execArgv (TZ <<atian25@qq.com>>)

4.2.0 / 2017-08-30
==================

  * feat: support $NODE_DEBUG_OPTION (#71)

4.1.0 / 2017-08-02
==================

  * feat: add `egg-bin autod --check` command (#70)

4.0.5 / 2017-07-05
==================

  * fix: only hotfix spawn-wrap on windows (#69)

4.0.4 / 2017-06-21
==================

  * fix: remove temp excludes
  * feat(cov): add prerequire option (#53)

4.0.3 / 2017-06-21
==================

  * fix: There is a case sensitive issue from spawn-wrap  on Windows (#67)

4.0.2 / 2017-06-20
==================

  * fix: should support multi exclude dirs (#66)

4.0.1 / 2017-06-20
==================

  * fix: ignore frontend files and document files (#65)

4.0.0 / 2017-06-20
==================

  * feat: use nyc instead of istanbul (#63)

3.7.0 / 2017-06-19
==================

  * feat: cov support output json-summary (#64)

3.6.0 / 2017-06-14
==================

  * feat: support cov command  in win32 (#52)
  * test: skip assert error stack on node >= 7.0.0 (#61)
  * fix: clean more mocha error stack (#60)

3.5.0 / 2017-06-08
==================

  * feat: simplify mocha error stack (#59)

3.4.2 / 2017-06-04
==================

  * fix: use context.env instead of process.env (#58)

3.4.1 / 2017-06-01
==================

  * fix: don't pass prerequire (#57)

3.4.0 / 2017-05-18
==================

  * feat(cov): add prerequire option (#53)

3.3.2 / 2017-04-28
==================

  * feat: change default timeout to 60000 (#50)

3.3.1 / 2017-04-25
==================

  * fix: cov replaced warning at win (#49)

3.3.0 / 2017-04-17
==================

  * feat: pass --check to pkgfiles (#48)

3.2.1 / 2017-04-01
==================

  * fix: -x only support string (#47)

3.2.0 / 2017-03-29
==================

  * feat: extractArgv refactor & extract debug port
  * feat: extractArgv support expose_debug_as

3.1.0 / 2017-03-21
==================

  * feat: use unparseArgv from common-bin (#45)

3.0.1 / 2017-03-21
==================

  * fix(cov): istanbul path env (#44)

3.0.0 / 2017-03-21
==================

  * refactor: [BREAKING_CHANGE] use common-bin 2.x (#41)

2.4.0 / 2017-03-09
==================

  * deps: upgrade istanbul to 1.1.0-alpha.1 (#43)

2.3.0 / 2017-03-08
==================

  * fix: add missing deps (#42)
  * feat: update pkg.files that if file exists (#37)
  * refactor: use framework (#39)

2.2.3 / 2017-02-25
==================

  * fix: support egg-bin dev --cluster and --baseDir (#36)

2.2.2 / 2017-02-25
==================

  * fix: use co-mocha instead of thunk-mocha (#38)

2.2.1 / 2017-02-19
==================

  * fix: support node4 (#35)

2.2.0 / 2017-02-15
==================

  * feat: commands support specific execArgv(harmony) (#33)
  * docs: missing debug description for zh-cn (#34)

2.1.0 / 2017-02-14
==================

  * feat: add sticky mode support (#32)

2.0.2 / 2017-01-24
==================

  * fix: .setup.js should be the first test file (#30)

2.0.1 / 2017-01-17
==================

  * fix: should support -p (#27)
  * docs: use V8 Inspector Integration for debug

2.0.0 / 2017-01-16
==================

  * feat(debug): [BREAKING_CHANGE] remove iron-node (#26)

1.10.1 / 2017-01-16
==================

  * fix: should pass customEgg to startCluster (#25)

1.10.0 / 2016-12-28
==================

  * feat: auto require setup file (#24)

1.9.1 / 2016-12-16
==================

  * fix: make sure dev command eggPath can be override (#23)

1.9.0 / 2016-12-16
==================

  * feat: auto detect available port (#22)

1.8.1 / 2016-12-14
==================

  * fix: add power-assert to deps (#21)

1.8.0 / 2016-12-14
==================

  * feat: build-in intelli-espower-loader (#20)

1.7.0 / 2016-11-03
==================

  * feat: try to use --inspect first (#19)

1.6.0 / 2016-10-28
==================

  * feat: use test when run cov on Windows (#18)

1.5.3 / 2016-10-28
==================

  * fix: wait more time for Window :cry: (#17)

1.5.2 / 2016-10-26
==================

  * fix(cov): wait 1 second for Windows (#16)

1.5.1 / 2016-10-20
==================

  * fix: link mocha bin from inner file (#15)
  * docs:add egg-bin dev options doc (#14)

1.5.0 / 2016-10-16
==================

  * test: exports mocha bin (#13)

1.4.0 / 2016-09-29
==================

  * feat(dev): pass debug args to execArgv (#12)

1.3.0 / 2016-08-19
==================

  * feat: resolve istanbul path for coffee (#9)

1.2.1 / 2016-08-18
==================

  * fix: can not find iron-node in subprocess (#8)

1.2.0 / 2016-08-04
==================

  * feat: add COV_EXCLUDES for coverage excludes (#7)

1.1.1 / 2016-08-03
==================

  * chore(deps): upgrade mocha@3 and glob@7 (#6)

1.1.0 / 2016-07-29
==================

  * feat: support mocha custom require args (#5)
  * refactor: use common-bin (#4)

1.0.2 / 2016-07-12
==================

  * refactor: rename DevCommand.js to dev_command.js (#3)
  * chore: add security check badge (#2)
  * refactor: use egg-utils (#1)

1.0.1 / 2016-06-20
==================

  * fix: let sub class can override getFrameworkOrEggPath

1.0.0 / 2016-06-19
==================

  * init version
