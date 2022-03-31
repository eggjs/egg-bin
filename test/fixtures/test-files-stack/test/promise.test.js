'use strict';

describe('promise.test.js', () => {
  it('should fail with simplify stack', async function() {
    return await new Promise((resolve, reject) => {
      reject(new Error('this is an error'));
    });
  });
});
