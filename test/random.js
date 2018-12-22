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
const { runAnalytics } = require('../analytics/analytics')
const analyticHelpers = require('../analytics/helpers')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();



// const test = async () => {
//   const user = await Account.findOne({ username : config.developmentUsername }).populate('memberOf').exec()
//   const folioIds = user.memberOf.map( g => g.folios ).reduce( (acc, folioList) => acc.concat(folioList), [])
//   const folios = await Folio.find({ _id : { $in : folioIds } }).populate('macheSubmissions').limit(5).exec()
//
//   const maches = await Mache.find({
//     memberOfFolios : { $exists : true, $not : { $size : 0 } },
//   }).limit(4).exec()
//
//   console.log(maches)
//
//   // console.log(folios)
//   process.exit(0);
// }

const test = async () => {
  const maches = await analyticHelpers.getCollaboratedMaches([], 2)
  const results = runAnalytics('mache', maches, ['elementCountByUser'] )
  console.log('Results', results)
  process.exit(0);
}

test();
