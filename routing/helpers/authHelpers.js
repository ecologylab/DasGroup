const authHelpers = {};
const config = require('config')
authHelpers.isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    const redirect = `${config.redirects.fromLoginToDasGroup}&redirectTo=${req.url}`
    console.log('les go', req.url, redirect)
    res.redirect(redirect);
  }
}


module.exports = authHelpers;
