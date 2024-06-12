const { isAuth } = require("../middlewares/is-auth");
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const expect = require("chai").expect;

describe("Auth Middleware", () => {
  it("should throw an error if there is no authorization header is present", done => {
    const req = {
      get: () => {
        return null;
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw("Not authenticated");
    done();
  });

  it("should throw an error if the authorization is only one string", done => {
    const req = {
      get: () => {
        return "sdfidf";
      },
    };
    expect(isAuth.bind(this, req, {}, () => {})).to.throw("Not authenticated");
    done();
  });

  it("should have a userId in the request body and the userId will not be null", done => {
    const req = {
      get: () => {
        return "sdfidf sdfkjkdfj";
      },
    };

    /**
     * This commented code will will change the global jwt verify method and it is not recommended to do this
     */
    // jwt.verify = () => {
    // //   return { userId: "abcdfdfd" };
    // // };

    const nack = sinon.stub(jwt, "verify").returns({ _id: "kdsfjkdsj" });
    isAuth(req, {}, () => {});
    expect(nack()).to.have.property("_id");
    expect(req).to.have.property("userId");
    nack.restore();
    sinon.restore();
    done();
  });
});
