process.env.NODE_ENV = 'dev'
const Account = require('../models/account');
const Folio = require('../models/folio');
const Group = require('../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../utils/logger');
const groupLogic = require('../routing/logic/groupLogic')
const accountLogic = require('../routing/logic/accountLogic')
const helpers = require('../routing/helpers/helpers')
const config = require('config')
const tokenHandler = require('../utils/tokenHandler')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); test() },
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
const test = () =>  {
  Folio.find({}).exec()
  .then( b => console.log(b) )
  .catch( e => console.log(e) )
}
