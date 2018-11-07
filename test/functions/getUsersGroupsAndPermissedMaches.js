process.env.NODE_ENV = 'dev'
const Account = require('../../models/account');
const Folio = require('../../models/folio');
const Mache = require('../../models/mache');
const Group = require('../../models/group');
const mongoose = require('mongoose');
const jsonfile = require('jsonfile');
const logger = require('../../utils/logger');
const groupLogic = require('../../routing/logic/groupLogic')
const testLogic = require('../../routing/logic/testLogic')
const accountLogic = require('../../routing/logic/accountLogic')
const helpers = require('../../routing/helpers/helpers')
const config = require('config')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();






const getUsersGroupsAndPermissedMaches = async () => {
  let user = await Account.findOne({username : "avsphere"}).populate('maches').exec()
  let collection = await helpers.getUsersGroupsAndPermissedMaches(user);
  console.log(collection)
  process.exit(0);
}

getUsersGroupsAndPermissedMaches();
