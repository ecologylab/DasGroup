const authHelpers = {};
const config = require('config')
authHelpers.isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    res.redirect(config.redirects.fromLoginToDasGroup);
  }
}


module.exports = authHelpers;
