const authHelpers = {};
const config = require('config');
const passport = require('passport');
const Account = require('../../models/account')
const logger = require('./logger');
authHelpers.isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    let redirect = config.redirects.fromLoginToDasGroup;
    if ( config.basePath == '/' ) {
      redirect += `&redirectTo=${req.url}`
    } else {
      redirect += `&redirectTo=${config.basePath}${req.url}`
    }
    res.redirect(redirect);
  }
}

if ( process.env.NODE_ENV === 'dev' ) {
  authHelpers.isAuthenticated = (req, res, next) => {
    if ( !req.hasOwnProperty('user') ) {
      Account.findOne( { username : config.developmentUsername } ).exec()
      .then( user => {
        req.login( user, (err) => {
          if (err) { logger.error("DEV authHelpers in login %O", err); throw err; }
          else {
            logger.notice("Development user: %O logged in", user.username)
            next();
          }
        })
      })
      .catch( e => {
        logger.error("Auth error %O", e)
        res.redirect(redirect);
      })
    } else {
      next();
    }
  }
}


module.exports = authHelpers;
