"use strict";

import mm, { MockOption } from "egg-mock";
import request = require("supertest");

describe("test/index.test.ts", () => {
  let app: any;
  before(() => {
    app = mm.cluster({
      opt: {
        execArgv: ["--require", require.resolve("ts-node/register")]
      }
    } as MockOption);
    return app.ready();
  });

  it("should work", async () => {
    const req = request(`http://127.0.0.1:${app.port}`);
    await req
      .get("/")
      .expect("hi, egg")
      .expect(200);
    return app.close();
  });
});
