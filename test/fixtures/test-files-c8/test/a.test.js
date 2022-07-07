'use strict';

const fs = require('fs');
const a = require('../lib/a');

describe('a.test.js', () => {
  it('should success', () => {
    a(true);
    a(false);
  });

  it('should show tmp', () => {
    const tmpdir = process.env.TMPDIR;
    console.log(tmpdir, fs.existsSync(tmpdir));
  });
});
