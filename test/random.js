const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
require('dotenv').config()
mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
let group = {}
// Group.findOne( {key : 'abc' })
// .exec()
// .then( g => {
//   let userId = g.roles.admins[0].toString(),
//       admins = Array.from(g.roles.admins, e => e.toString() );
//
//
//   console.log(admins.includes(userId), userId)
// })
// Group.findOne( {key : 'abc' })
// .exec()
// .then( g => { group = g; return true; })
// .then( _ => Account.findOne({ username : 'avsphere'}).exec() )
// .then( user => {
//   user.getAdminOf(Group)
//   .then( adminOf => {
//     console.log(group._id, adminOf)
//     console.log(adminOf.includes(group._id.toString() ) )
//
//   })
// })

const getAvsp = Account.findOne({username : 'avsphere'})

getAvsp
.exec()
.then( user => groupLogic.isUserAdminOfGroup({key : 'def' }, user) )
.then( adminStatus => console.log(adminStatus))
.catch( e => {
  console.log("In outter e", e)
})
