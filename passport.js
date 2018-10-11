const LocalStrategy = require('passport-local').Strategy;
const Account = require('./models/account');

//This is dependent on Live Maches auth

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    // console.log("in serialize", user)
    done(null, user.username);
  });
  passport.deserializeUser(function(username, done) {
    Account.findOne({ username : username}, (err, user) => {
      if ( err ) { console.log( "ERROR in passport", err ) }
      done(err, user);
    })
  });
}
