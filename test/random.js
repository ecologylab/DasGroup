const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
const accountLogic = require('../routing/logic/accountLogic')
require('dotenv').config()
mongoose.connect(process.env.DB_CONN_DEV, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
let group = {}
const randomId = mongoose.Types.ObjectId();
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

// getAvsp
// .exec()
// .then( user => groupLogic.isUserAdminOfGroup({key : 'def' }, user) )
// .then( adminStatus => console.log(adminStatus))
// .catch( e => {
//   console.log("In outter e", e)
// })

accountLogic.addGroupToUser({ username: 'avsphere'}, "5babac5d18ef68217ceb9816")
.then( s => {
  console.log(s);
})
.catch( e => {
  console.error(e)
})
// getAvsp
// .exec()
// .then( user => accountLogic.addGroupToUser(randomId) )
// .then( s => {
//   if ( s ) {
//     console.log("User exists")
//   } else {
//     console.log("User DOES NOT exist")
//
//   }
// })
// .catch( e => {
//   console.log("In outter e", e)
// })
