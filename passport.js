const LocalStrategy = require('passport-local').Strategy;
const Account = require('./models/account');
require('dotenv').config()

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    console.log("in serialize", user)
    done(null, user._id);
  });
  passport.deserializeUser(function(id, done) {
    console.log("in deserializeUser", id)
    Account.findById(id, (err, user) => {
      if ( err ) { console.log( err ) }
      console.log("Found user", user)
      done(err, user);
    })
  });
//   passport.use('local', new LocalStrategy({
//     passReqToCallback : true
//   },
//     function(req, username, password, done) {
//       User.findOne({ username : username }, ( err, user ) => {
//         if ( err ) { console.log("HERE IN ERROR", err); }
//         if ( !user ) {
//           throw new Error('User does not exist')
//         }
//         else {
//           console.log("returning user");
//           return done(null, user);
//         }
//       })
//     }
//   )
// );

}
