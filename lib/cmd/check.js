'use strict';

const Command = require('../command');

class CheckCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin check';
    this.options = {
      format: {
        description: 'eslint output format',
        default: 'codeframe',
      },
    };
  }

  get description() {
    return 'Check egg project for collect useful infomation to report issue';
  }

  * run({ cwd }) {
    // check eggache
    const eslintBin = require.resolve('eslint/bin/eslint');
    const eslintArgs = this.helper.unparseArgv({
      _: [ '.' ],
      config: require.resolve('../check-eslintrc'),
      'no-eslintrc': true,
      format: 'codeframe',
    });
    console.info('[egg-bin] run check: %s %s', eslintBin, eslintArgs.join(' '));
    yield this.helper.forkNode(eslintBin, eslintArgs, { cwd });
  }
}

module.exports = CheckCommand;
