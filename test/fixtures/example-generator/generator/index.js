'use strict';

module.exports = class Generator {
  constructor(options) {
    this.options = options;
  }

  * generate() {
    const { baseDir, framework, env, config, loadUnits, plugins, argv } = this.options;
    console.log('### run genertor from app');
    console.log(`options.baseDir: ${baseDir}`);
    console.log(`options.framework: ${framework}`);
    console.log(`options.env: ${env}`);
    console.log(`options.config.env: ${config.env}`);
    console.log(`options.config.test: ${config.test}`);
    console.log(`options.argv.foo: ${argv.foo}`);
    console.log(`options.loadUnits: ${!!loadUnits}`);
    console.log(`options.plugins: ${!!plugins}`);
  }
};
