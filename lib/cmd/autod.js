const Command = require('../command');

class AutodCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin autod';
    this.options = {
      check: {
        description: '[deprecated]',
      },
    };
  }

  get description() {
    return '[deprecated]';
  }

  async run() {
    console.log('[deprecated] please remove this command');
  }
}

module.exports = AutodCommand;
