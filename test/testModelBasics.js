process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const config = require('config')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
const userId = mongoose.Types.ObjectId();
const userId2 = mongoose.Types.ObjectId();
const randId = mongoose.Types.ObjectId();
const groupDupe = () => {
  let g = new Group({
    creator : userId,
    members : [userId],
    "roles.admins" : [userId],
    name : 'test',
    description : 'testy'
  })
  return new Promise( (resolve, reject) => {
    g.save()
    .then( s => {
      Group.updateOne({ _id : s._id }, { $addToSet : { members : [userId, userId2] } })
      .exec()
      .then( saved => Group.findOne({ _id : s._id}).exec() )
      .then( g => logger.test("groupDupeCheck - should be 2 %O", g.members.length) )
      .then( _ => Group.deleteOne({ _id : s._id}).exec() )
      .then( _ => resolve(true) )
      .catch( e => console.log(e) )
    })
    .catch( e => console.log(e) )
  })

}


const userFind = () => {
  Account.findOne({ _id : randId })
  .exec()
  .then( a =>  {
    if ( !a ) { a = {} }
    console.log(a);
  })
  .catch( e => console.log(e) )
}


userFind();

// groupDupeCheck()
