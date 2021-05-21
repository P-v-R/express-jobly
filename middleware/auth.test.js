"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  checkAdminOrAuthorizedUser,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const unauthUserJwt = jwt.sign({ username: "unauthorized", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");
const testAdminJwt = jwt.sign({ username: "testAdmin", isAdmin: true }, SECRET_KEY);


describe("authenticateJWT", function () {
  test("works: via header", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        isAdmin: false,
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensure", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureAdmin", function () {
  test("works for admin", function () {
    expect.assertions(1);
    const req = { headers: { authorization: `Bearer ${testAdminJwt}` } };
    const res = { locals: { user: { username: 'testAdmin', isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("fails for non-admin", function () {
    expect.assertions(1);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: { user: { username: 'test', isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("fails for missing admin key on user", function () {
    expect.assertions(1);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: { user: { username: 'test' } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });

  test("fails for incorrect isAdmin: value", function () {
    expect.assertions(1);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: { user: { username: 'test', isAdmin: 'nope' } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });
})


/** Tests that GET /:username routes work only for admins
 * and users accessing their own profiles.
 */
describe("checkAdminOrAuthorizedUser", function () {
  test("fails for user that is not admin or user in route/self", function () {
    expect.assertions(1);
    const req = { params: { username: `u2` } };
    const res = { locals: { user: { username: 'u1', isAdmin: false } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    checkAdminOrAuthorizedUser(req, res, next);
  });

  test("get /:username works for user accessing self profile", function () {
    expect.assertions(1);
    const req = { params: { username: `u2` } };
    const res = { locals: { user: { username: 'u2', isAdmin: false } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    checkAdminOrAuthorizedUser(req, res, next);
  });

  test("get /:username accessible to admins", function () {
    expect.assertions(1);
    const req = { params: { username: `u2` } };
    const res = { locals: { user: { username: 'admin', isAdmin: true } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    checkAdminOrAuthorizedUser(req, res, next);
  });
  //TODO refactor for this test case 
  test("fails for missing admin key on user", function () {
    expect.assertions(1);
    const req = { headers: { authorization: `Bearer ${testJwt}` } };
    const res = { locals: { user: { username: 'test' } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });
});
