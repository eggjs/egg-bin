'use strict';

module.exports = class Generator {
  constructor(options) {
    this.options = options;
  }

  * generate() {
    throw new Error('skip-error generator error');
  }
};
