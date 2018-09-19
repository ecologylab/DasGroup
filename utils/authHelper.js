const Account = require('../models/account');

function isAuthenticated(req, res, next) {
  if ( req.isAuthenticated() ) {
    next()
  } else {
    res.redirect('https://localhost:5000/');
  }
}
function getUser(userInfo) {
  console.log("USER INFO ", userInfo)
  return new Promise( (resolve, reject) => {
    Account.findOne( {username : userInfo.username}, (err, foundUser) => {
      if ( err ) { reject(err); }
      else if ( !foundUser ) {
        reject("No user found in auth helper getUser")
      } else {
        resolve(foundUser);
      }
    })
  })
}

function autoLogin(req, res, userInfo) {
  return new Promise( (resolve, reject) => {
    getUser(userInfo).then( user => {
      if (!user) { reject("No user found in autologin") }
      req.login(user, (err) => {
        if (err) { reject(err); }
        resolve(user);
      })
    })
  })
}


module.exports = {
  isAuthenticated : isAuthenticated,
  autoLogin : autoLogin
}
