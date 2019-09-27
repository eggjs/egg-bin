"use strict";

import mm, { MockOption } from "egg-mock";
import request = require("supertest");

describe("test/index.test.ts", () => {
  it("should work", async () => {
    const app: any = mm.cluster({
      opt: {
        execArgv: ["--require", require.resolve("ts-node/register")]
      },
      sticky: true
    } as MockOption);
    return app
      .ready()
      .then(() => {
        const req = request(`http://127.0.0.1:${app.port}`);
        return req
          .get("/")
          .expect("hi, egg")
          .expect(200);
      })
      .then(() => app.close());
  });
});
