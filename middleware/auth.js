"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to ensure that user is admin for admin routes
 * If not, raises Unauthorized Error.
 */

// TODO also check for non logged in users to raise unauth error 
// write tests to show this ^^^ bug before we fix vvv this bug

function ensureAdmin(req, res, next){
  try {
    if (res.locals.user.isAdmin !== true) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/* middleware to use on routes where currentUser is same as user being 
* (updated/deleted/viewed) OR current user is admin.
* 
* not raises Unauthorized
*/ 

// function checkAdminOrAuthorizedUser(req, res, next){

// }


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin
};
