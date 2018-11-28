process.env.NODE_ENV = 'dev'
const config = require('config')
const mongoose = require('mongoose')
const Account = require('../models/account');
const Group = require('../models/group');
const Mache = require('../models/mache');
const Folio = require('../models/folio');
const Clipping = require('../models/clipping');
const Element = require('../models/element');
const Role = require('../models/role');
const { extractMaches, extractElements, extractClippings } = require('./helpers')
const testAnalytics = require('./testAnalytics')

mongoose.connect(config.database.connectionString, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database. Running analytics");  },
  err => { console.log("ERROR - Database connection failed")}
)


const fancyAnal = async () => {
  const group = await Group.findOne({ folios : { $exists : true, $not : { $size : 0 } } }).exec()
  const maches = await extractMaches(group)
  const elements = extractElements(maches);
  console.log(elements)
}

fancyAnal()
// testAnalytics.testAll()
