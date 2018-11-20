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
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)

const shotgun = async () => {
  const user = await Account.findOne( { username : config.developmentUsername } ).populate('memberOf').exec()
  const saves = user.memberOf.map( async (g) => {
    const groupLocator = { groupKey : g.key }
    await testLogic.addMacheToFolioShotgun(groupLocator);
  })
  Promise.all(saves)
  .then(_ => {
    console.log("Shotgun success")
    process.exit(0);
  })
  .catch( e => console.error("Failed shotgun", e) )
}


shotgun();
