process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
const accountLogic = require('../routing/logic/accountLogic')
const helpers = require('../routing/helpers/helpers')
const config = require('config')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
let group = {}
const randomId = mongoose.Types.ObjectId();


// Account.find({username : 'avsphessre'})
// .exec()
// .then( u => {
//   if ( !u ) { console.log("in if", u) }
//   else { console.log(u) }
// })

//
// helpers.findUser({username : 'avsphere'})
// .then( u => console.log(u) )
// .catch(e => console.log(e) )


console.log(config, this)
