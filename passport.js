const LocalStrategy = require('passport-local').Strategy;
const Account = require('./models/account');
require('dotenv').config()

//This is dependent on Live Maches auth

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    // console.log("in serialize", user)
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    // console.log("in deserializeUser", id)
    Account.findById(id, (err, user) => {
      if ( err ) { console.log( err ) }
      done(err, user);
    })
  });
}
