const authHelpers = {};
const config = require('config')
authHelpers.isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    let redirect = config.redirects.fromLoginToDasGroup;
    if ( config.basePath != '/' ) {
      redirect += `&redirectTo=${req.url}`
    } else {
      redirect += `&redirectTo=${config.basePath}${req.url}`
    }
    console.log('les go', req.url, redirect)
    res.redirect(redirect);
  }
}


module.exports = authHelpers;
