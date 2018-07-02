'use strict';

module.exports = class Generator {
  constructor(options) {
    this.options = options;
  }

  async generate() {
    throw new Error('skip-error generator error');
  }
};
