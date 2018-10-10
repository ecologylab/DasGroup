const helpers = require('./helpers')
const config = require('config')
const isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    res.redirect(config.redirects.fromLoginToDasGroup);
  }
}

module.exports = {
  isAuthenticated : isAuthenticated
}
