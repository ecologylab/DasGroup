//before I refactor everything
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
const accountLogic = require('../routing/logic/accountLogic')
const helpers = require('../routing/helpers/helpers')
const config = require('config')
const tokenHandler = require('../utils/tokenHandler')
mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected!"); test(); },
  err => { console.log("ERROR - Database connection failed")}
)
const randomId = mongoose.Types.ObjectId();
const getQuery = helpers.getQuery;


const findGroup = (query, options) => {
  return new Promise( (resolve, reject) => {
    query.visibility = { $ne : 'removed' }
    let queryFn = Group.find(query);
    if ( options && options.hasOwnProperty('populate') ) {
      queryFn = queryFn.populate(options.populate.name, options.populate.returnOnly);
    }
    queryFn.exec()
    .then( (group) => {
      if ( group.length === 1 ) { resolve(group[0]) }
      else if ( group.length < 1 ) { reject('No group found')}
      else { resolve(group); }
    })
    .catch( e => {
      logger.error('Error in findGroup %j %O', query, e)
      reject(e);
    })
  })
}



const test = () => {
  console.log(Group.aFind())
  const find = Group.aFind();
  find({"key" : "abc" }).exec()
  .then( d => {
    console.log("group", d);
  })
  .catch( e => {
    console.error('Error in test', e)
  })
}
