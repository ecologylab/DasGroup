const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
require('dotenv').config()
mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)

const randId = mongoose.Types.ObjectId();
let g = new Group({
  creator : randId,
  admins : [randId],
  members : [randId],
  name : 'testy1',
  description : 'more test'
})

g.save( (err, doc) => {
  if ( err ) { console.log(err); }
  console.log("appears fine!", doc)
})
