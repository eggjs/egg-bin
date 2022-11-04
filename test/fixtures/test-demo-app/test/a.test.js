'use strict';

const { app } = require('egg-mock/bootstrap');

describe('a.test.js', () => {
  it('should work', async () => {
    await app.httpRequest()
      .get('/')
      .expect(200)
      .expect({});
  });
});
