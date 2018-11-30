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
const moment = require('moment')
const { extractMaches, extractElements, extractClippings, macheAnalysis, ...helpers } = require('./helpers')

mongoose.connect(config.database.devSeedDb, { useNewUrlParser : true }).then(
  () => { console.log("Connected to database. Running analytics"); run()  },
  err => { console.log("ERROR - Database connection failed")}
)



const getClippingDistribution = async () => {
  const clippings = await Clipping.find({})
  const clippingDist = {}
  clippings
  .map( c => c.toObject() )
  .forEach( c => {
    clippingDist.hasOwnProperty(c.type) ? clippingDist[c.type]++ : clippingDist[c.type] = 1
  })

  Object.keys(clippingDist).forEach( distKey => {
    clippingDist[distKey] = { type : distKey, count : clippingDist[distKey], percentage : clippingDist[distKey] / clippings.length }
  })
  return clippingDist;
}

const getMacheDateDistribution = async () => {
  const daysOld = ( maches ) => maches.map( ({last_modified}) => moment().diff(last_modified, 'days') )
  const maches = await Mache.find({}).select('last_modified')
  const macheAges = daysOld(maches).sort()

  const q1 = macheAges.splice(0, macheAges.length * .25)
  const q2 = macheAges.splice(0, macheAges.length * .25)
  const q3 = macheAges.splice(0, macheAges.length * .25)
  const q4 = macheAges.splice(0, macheAges.length * .25)

}

const test = async () => {
  const maches = await Mache
  .find({ elements : { $exists : true, $not : { $size : 0 } } })
  .populate({ path : 'elements' , populate : { path : 'clipping' } })
  .limit(500).exec()
  const elements = extractClippings(maches);
  console.log(elements)

}



const run = async() => {
  const clippingDistribution = await getClippingDistribution()
  console.log(clippingDistribution)
  // await getMacheDateDistribution()
  process.exit(0)
}
