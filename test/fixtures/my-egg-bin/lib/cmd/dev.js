'use strict';

const path = require('path');
const DevCommand = require('../../../../../').DevCommand;

class MyDevCommand extends DevCommand {
  async run(context) {
    // find your framework
    const yadan = path.join(__dirname, '../../../custom-framework-app/node_modules/yadan');
    context.argv.framework = yadan;
    setTimeout(() => {
      console.log('proc: %s', this.proc.pid);
    }, 1000);
    await super.run(context);
  }
}

module.exports = MyDevCommand;
