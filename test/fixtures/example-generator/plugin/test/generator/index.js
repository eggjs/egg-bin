'use strict';

module.exports = class Generator {
  constructor(options) {
    this.options = options;
  }

  async generate() {
    console.log('### run genertor from plugin');
  }
};
