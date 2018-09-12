const User = require('../models/user')
const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database!") },
  err => { console.log("ERROR - Database connection failed")}
)



function autoLogin(user) {
  return new Promise( (resolve, reject) => {
    User.findById(user._id, (err, user) => {
      console.log(user);
    })
  })
}


autoLogin({ _id : '5b86dc58e99d513f4f7b9245'}).then( s => console.log(s) )
