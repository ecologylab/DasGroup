const User = require('./models/user');
const mongoose = require('mongoose');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN, { useNewUrlParser : true }).then(
  () => { console.log("Connected and seeding!"); seed(); },
  err => { console.log("ERROR - Database connection failed")}
)

const seed = () => {
  User.deleteMany({}, (err) => {
    if (err) { console.error(err);}
    else {
      const u = new User({username : 'avsphere', password : 'avsphere'})
      u.save().then( () => {
        console.log("User created!");
        process.exit();
      })
    }
  })
}
