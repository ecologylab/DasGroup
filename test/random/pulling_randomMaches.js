process.env.NODE_ENV = 'dev'
const Account = require('../../models/account');
const Folio = require('../../models/folio');
const Mache = require('../../models/mache');
const Group = require('../../models/group');
const mongoose = require('mongoose');
const seedFile = './scripts/seed/seedData.json';
const jsonfile = require('jsonfile');
const logger = require('../../utils/logger');
const groupLogic = require('../../routing/logic/groupLogic')
const testLogic = require('../../routing/logic/testLogic')
const accountLogic = require('../../routing/logic/accountLogic')
const helpers = require('../../routing/helpers/helpers')
const config = require('config')
const tokenHandler = require('../../utils/tokenHandler')
const { runAnalytics } = require('../../analytics/analytics')
const analyticHelpers = require('../../analytics/helpers')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();
const getRandomInt = (n) => Math.floor( Math.random()*n )




const test = async () => {
  try {
    const maches = await Maches.find({}).skip( getRandomInt(500) ).limit(10).exec()
    const keys = maches.map( m => m.hash_key )
    console.log(keys)
  } catch ( e ) {
    console.log("err")
  }
  process.exit(0)
}

test();
