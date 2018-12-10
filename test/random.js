process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Folio = require('../models/folio');
const Mache = require('../models/mache');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
const testLogic = require('../routing/logic/testLogic')
const accountLogic = require('../routing/logic/accountLogic')
const helpers = require('../routing/helpers/helpers')
const config = require('config')
const tokenHandler = require('../utils/tokenHandler')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();

//
// helpers.findGroup({ key : 'abc'})
// .then( group => {
//   const members = group.members;
//   const randomMember = members[0];
//   console.log(members.includes(randomMember))
//
// })
// const setAaronsMaches = () => {
//   const findMache = (macheId) => Mache.findById(macheId).exec()
//   return new Promise( (resolve, reject) => {
//     Account.findOne({ username : 'avsphere'}).exec()
//     .then( avsphere => Promise.all( avsphere.maches.map( macheId => findMache(macheId)) ))
//     .then( maches => {
//       console.log("maches", maches)
//     })
//   })
// }
// let group = {}
// Group.findOne({ 'key' : '_YB6qwMv0' })
// .populate({ path : 'folios', populate : { path : 'macheSubmissions.mache' } })
// .exec()
// .then( g => {
//   console.log(g.folios[0].macheSubmissions);
// })


const test = async () => {
  let user = await Account.findOne({ username : "avsphere"}).exec()
  user.email = "avsp.here@gmail.com"
  user.subscriber = true;
  await user.save()
  console.log(user)
  process.exit(0);
}

test();
