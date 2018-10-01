const authHelpers = {};

authHelpers.isAuthenticated = (req, res, next) => {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    res.redirect('https://localhost:5000/?sendBack=true');
  }
}


module.exports = authHelpers;
