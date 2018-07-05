'use strict';

module.exports = class Generator {
  constructor(options) {
    this.options = options;
  }

  * generate() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('skip-error generator error'));
      }, 100);
    });
  }
};
